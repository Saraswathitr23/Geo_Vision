from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
import sqlite3
import os
import uuid
import random
import csv
from pydantic import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing import image
import tkinter as tk
from tkinter import filedialog
from flask_jwt_extended import get_jwt

app = Flask(__name__)
CORS(app)

# ---------------- CONFIG ----------------

app.config["JWT_SECRET_KEY"] = "geopoverty-secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 3600
app.config["UPLOAD_FOLDER"] = "uploads/images"

jwt = JWTManager(app)
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

# ---------------- DATABASE ----------------

def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    db = get_db()
    cur = db.cursor()

    # USERS
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            mobile TEXT UNIQUE,
            password TEXT,
            organization TEXT,
            role TEXT DEFAULT 'public'
        )
    """)

    # REGIONS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS regions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        district TEXT,
        state TEXT,
        latitude REAL,
        longitude REAL
    )
""")

    # INFRASTRUCTURE
    cur.execute("""
        CREATE TABLE IF NOT EXISTS infrastructure (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            region_id INTEGER,
            schools INTEGER,
            hospitals INTEGER,
            road_coverage REAL,
            water_access REAL,
            population INTEGER,
            FOREIGN KEY(region_id) REFERENCES regions(id)
        )
    """)

    # ANALYSIS
    cur.execute("""
        CREATE TABLE IF NOT EXISTS analysis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            region_id INTEGER,
            image_path TEXT,
            poverty_score REAL,
            poverty_level TEXT,
            confidence REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(region_id) REFERENCES regions(id)
        )
    """)

    # NOTIFICATIONS
    cur.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            message TEXT,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    db.commit()
    db.close()

init_db()

# ---------------- UTILS ----------------

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

model_files = sorted([f for f in os.listdir(MODEL_DIR) if f.endswith(".h5")])
model_path = os.path.join(MODEL_DIR, model_files[-1])

print("Loading model:", model_path)

model = tf.keras.models.load_model(model_path)

class_names = ['highpoverty', 'lowpoverty', 'mediumpoverty']



def calculate_poverty(infra):
    school_gap = max(0, 5 - infra["schools"])
    hospital_gap = max(0, 2 - infra["hospitals"])
    road_gap = 100 - infra["road_coverage"]
    water_gap = 100 - infra["water_access"]

    score = (
        school_gap * 10 +
        hospital_gap * 15 +
        road_gap * 0.3 +
        water_gap * 0.3
    )

    score = min(100, score)

    if score <= 30:
        level = "Low"
    elif score <= 60:
        level = "Medium"
    else:
        level = "High"

    return score, level


# ---------------- AUTH ----------------

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json

    hashed = generate_password_hash(data["password"])

    db = get_db()
    try:
        db.execute("""
            INSERT INTO users (name,email,mobile,password,organization,role)
            VALUES (?,?,?,?,?,?)
        """, (
            data["name"],
            data["email"],
            data["mobile"],
            hashed,
            data.get("organization"),
            data.get("role", "public")
        ))
        db.commit()
        db.close()
        return jsonify({"msg": "Registered"})
    except:
        return jsonify({"msg": "User already exists"}), 400




def admin_required():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return False
    return True


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json

    db = get_db()
    user = db.execute("""
        SELECT * FROM users WHERE email=? OR mobile=?
    """, (data["login"], data["login"])).fetchone()
    db.close()

    if not user or not check_password_hash(user["password"], data["password"]):
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_access_token(
    identity=str(user["id"]),
    additional_claims={"role": user["role"]}
)

    return jsonify({
        "token": token,
        "role": user["role"],
        "name": user["name"]
    })

# ---------------- REGION ----------------

@app.route("/api/regions", methods=["POST"])
@jwt_required()
def create_region():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    
 
    cursor.execute("INSERT INTO regions (name, district, state, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
                   (data["name"], data["district"], data["state"], data["latitude"], data["longitude"]))
    region_id = cursor.lastrowid


    cursor.execute("""
        INSERT INTO infrastructure (region_id, schools, hospitals, road_coverage, water_access, population)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        region_id, 
        data.get("schools", 0), 
        data.get("hospitals", 0), 
        data.get("road_coverage", 0.0), 
        data.get("water_access", 80.0), 
        data.get("population", 15000)
    ))

    db.commit()
    db.close()
    return jsonify({"msg": "Success", "id": region_id})


#---------------- GET REGIONS ----------------
@app.route("/api/regions", methods=["GET"])
@jwt_required()
def get_regions():
    db = get_db()
    rows = db.execute("SELECT * FROM regions").fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

# ---------------- Update REGION ----------------
@app.route("/api/regions/<int:region_id>", methods=["PUT"])
@jwt_required()
def update_region(region_id):

    if not admin_required():
        return jsonify({"msg": "Admins only"}), 403

    data = request.json

    db = get_db()
    db.execute("""
        UPDATE regions
        SET name=?, district=?, state=?, latitude=?, longitude=?
        WHERE id=?
    """, (
        data["name"],
        data["district"],
        data["state"],
        data.get("latitude"),
        data.get("longitude"),
        region_id
    ))

    db.commit()
    db.close()

    return jsonify({"msg": "Region updated"})

# 
@app.route("/api/regions/<int:region_id>", methods=["DELETE"])
@jwt_required()
def delete_region(region_id):

    if not admin_required():
        return jsonify({"msg": "Admins only"}), 403

    db = get_db()
    db.execute("DELETE FROM regions WHERE id=?", (region_id,))
    db.commit()
    db.close()

    return jsonify({"msg": "Region deleted"})




# ---------------- INFRASTRUCTURE ----------------

@app.route("/api/infrastructure", methods=["POST"])
@jwt_required()
def add_infrastructure():

    if not admin_required():
        return jsonify({"msg": "Admins only"}), 403

    data = request.json
    db = get_db()
    db.execute("""
        INSERT INTO infrastructure
        (region_id,schools,hospitals,road_coverage,water_access,population)
        VALUES (?,?,?,?,?,?)
    """, (
        data["region_id"],
        data["schools"],
        data["hospitals"],
        data["road_coverage"],
        data["water_access"],
        data["population"]
    ))
    db.commit()
    db.close()

    return jsonify({"msg": "Infrastructure added"})






@app.route("/api/infrastructure/<int:region_id>", methods=["PUT"])
@jwt_required()
def update_infrastructure(region_id):

    if not admin_required():
        return jsonify({"msg": "Admins only"}), 403

    data = request.json

    db = get_db()
    db.execute("""
        UPDATE infrastructure
        SET schools=?, hospitals=?, road_coverage=?, water_access=?, population=?
        WHERE region_id=?
    """, (
        data["schools"],
        data["hospitals"],
        data["road_coverage"],
        data["water_access"],
        data["population"],
        region_id
    ))

    db.commit()
    db.close()

    return jsonify({"msg": "Infrastructure updated"})

@app.route("/api/infrastructure", methods=["GET"])
@jwt_required()
def get_infrastructure(region_id):
    db = get_db()
    infra = db.execute("""
        SELECT schools, hospitals, road_coverage, water_access, population 
        FROM infrastructure WHERE region_id=?
    """, (region_id,)).fetchone()
    db.close()

    if not infra:
        return jsonify({"msg": "No infrastructure data"}), 404

    return jsonify(dict(infra))

@app.route("/api/all-data", methods=["GET"])
@jwt_required()
def get_all_detailed_data():
    db = get_db()
   
    rows = db.execute("""
        SELECT r.id, r.name, r.district, r.state, r.latitude, r.longitude,
               i.schools, i.hospitals, i.road_coverage, i.water_access, i.population
        FROM regions r
        LEFT JOIN infrastructure i ON r.id = i.region_id
    """).fetchall()

    print(rows)
    
    db.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/infrastructure/<int:region_id>", methods=["DELETE"])
@jwt_required()
def delete_infrastructure(region_id):

    if not admin_required():
        return jsonify({"msg": "Admins only"}), 403

    db = get_db()
    db.execute("DELETE FROM infrastructure WHERE region_id=?", (region_id,))
    db.commit()
    db.close()

    return jsonify({"msg": "Infrastructure deleted"})




@app.route("/api/analysis/<int:region_id>", methods=["GET"])
@jwt_required()
def get_region_analysis(region_id):
    db = get_db()
    result = db.execute("""
        SELECT poverty_score, poverty_level, confidence
        FROM analysis
        WHERE region_id=?
        ORDER BY created_at DESC
        LIMIT 1
    """, (region_id,)).fetchone()
    db.close()

    if not result:
        return jsonify({"msg": "No analysis yet"}), 404

    return jsonify(dict(result))

@app.route("/api/analyze/infrastructure/<int:region_id>", methods=["POST"])
@jwt_required()
def analyze_infra(region_id):

    db = get_db()
    infra = db.execute("""
        SELECT * FROM infrastructure WHERE region_id=?
    """, (region_id,)).fetchone()

    if not infra:
        return jsonify({"msg": "No infra data"}), 404

    score, level = calculate_poverty(dict(infra))

    db.execute("""
        INSERT INTO analysis (region_id,poverty_score,poverty_level)
        VALUES (?,?,?)
    """, (region_id, score, level))
    db.commit()
    db.close()

    return jsonify({
        "poverty_score": score,
        "poverty_level": level
    })

@app.route("/api/suggestions/<int:region_id>", methods=["GET"])
@jwt_required()
def get_suggestions(region_id):

    db = get_db()
    infra = db.execute("""
        SELECT * FROM infrastructure WHERE region_id=?
    """, (region_id,)).fetchone()

    db.close()

    if not infra:
        return jsonify({"msg": "No infra data"}), 404

    infra = dict(infra)

    suggestions = []

    if infra["schools"] < 5:
        suggestions.append("Build additional primary schools")

    if infra["hospitals"] < 2:
        suggestions.append("Increase healthcare facilities")

    if infra["road_coverage"] < 70:
        suggestions.append("Improve road connectivity")

    if infra["water_access"] < 70:
        suggestions.append("Upgrade water access systems")

    if not suggestions:
        suggestions.append("Infrastructure level is adequate")

    return jsonify({
        "region_id": region_id,
        "suggestions": suggestions
    })
@app.route("/api/recent-analyses", methods=["GET"])
@jwt_required()
def recent_analyses():
    db = get_db()
    rows = db.execute("""
        SELECT regions.name, analysis.poverty_level, analysis.created_at
        FROM analysis
        LEFT JOIN regions ON analysis.region_id = regions.id
        ORDER BY analysis.created_at DESC
        LIMIT 5
    """).fetchall()
    db.close()

    return jsonify([dict(r) for r in rows])


@app.route("/api/notifications/<int:notif_id>/read", methods=["PUT"])
@jwt_required()
def mark_notification_read(notif_id):
    db = get_db()
    db.execute("""
        UPDATE notifications SET is_read=1 WHERE id=?
    """, (notif_id,))
    db.commit()
    db.close()
    return jsonify({"msg": "Marked as read"})
# ---------------- IMAGE ANALYZE ----------------

@app.route("/api/upload", methods=["POST"])
@jwt_required()
def upload_image():

    if "image" not in request.files:
        return jsonify({"msg": "No file"}), 400

    file = request.files["image"]

    if not allowed_file(file.filename):
        return jsonify({"msg": "Invalid file type"}), 400

    filename = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)

    # -------- LOAD IMAGE FOR MODEL --------

    IMG_SIZE = (224, 224)

    img = image.load_img(path, target_size=IMG_SIZE)
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # -------- MODEL PREDICTION --------

    predictions = model.predict(img_array)

    predicted_index = int(np.argmax(predictions))
    predicted_class = class_names[predicted_index]
    confidence = float(np.max(predictions)) * 100

    # Convert label to readable form
    if predicted_class == "highpoverty":
        level = "High"
    elif predicted_class == "mediumpoverty":
        level = "Medium"
    else:
        level = "Low"

    score = round(confidence, 2)

    user_id = get_jwt_identity()

    db = get_db()

    db.execute("""
        INSERT INTO analysis
        (user_id,image_path,poverty_score,poverty_level,confidence)
        VALUES (?,?,?,?,?)
    """, (user_id, path, score, level, confidence))

    db.commit()

    db.execute("""
        INSERT INTO notifications (user_id,message)
        VALUES (?,?)
    """, (user_id, f"Analysis completed: {level} poverty ({score}%)"))
    db.commit()

    db.close()

    return jsonify({
        "poverty_level": level,
        "confidence": round(confidence, 2)
    })



import osmnx as ox
import geopandas as gpd
from shapely.geometry import Point

def circle_polygon(lat, lon, radius_m):
    gdf = gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326")
    utm = gdf.to_crs(gdf.estimate_utm_crs())
    circle = utm.buffer(radius_m).to_crs("EPSG:4326").iloc[0]
    return circle


def run_full_analysis(lat, lon, radius_m, output_name):

    polygon = circle_polygon(lat, lon, radius_m)

    area_km2 = gpd.GeoSeries([polygon], crs="EPSG:4326") \
        .to_crs(epsg=3857).area.iloc[0] / 1e6

  
    buildings = ox.features_from_polygon(polygon, tags={"building": True})
    building_count = len(buildings)

    
    hospitals = ox.features_from_polygon(polygon, tags={"amenity": "hospital"})
    hospital_count = len(hospitals)

   
    schools = ox.features_from_polygon(polygon, tags={"amenity": "school"})
    school_count = len(schools)
    score = (100 - building_count) + hospital_count * 5 + school_count * 3


   
    poverty_score = max(0, min(100, score))

  
    if poverty_score <= 30:
        poverty_level = "Low"
    elif poverty_score <= 60:
        poverty_level = "Medium"
    else:
        poverty_level = "High"

    return {
        "Building Count": building_count,
        "Hospital Count": hospital_count,
        "School Count": school_count,
        "Road Length (km/km²)": 10,
        "Poverty Score (0-100)": poverty_score,
        "Poverty Level": poverty_level
    }


@app.route("/api/analyze", methods=["POST"])
@jwt_required()
def analyze():

    try:
        data = request.get_json()

        lat = data.get("lat")
        lon = data.get("lon")
        radius = data.get("radius", 2000)

        if lat is None or lon is None:
            return jsonify({"msg": "Latitude and Longitude required"}), 400

        result = run_full_analysis(
            float(lat),
            float(lon),
            int(radius),
            "analysis_result"
        )

        return jsonify({
            "building_count": result["Building Count"],
            "hospital_count": result["Hospital Count"],
            "school_count": result["School Count"],
            "road_density": result["Road Length (km/km²)"],
            "poverty_score": result["Poverty Score (0-100)"],
            "poverty_level": result["Poverty Level"]
        })

    except Exception as e:
        print("Analysis Error:", e)
        return jsonify({"msg": "Analysis failed"}), 500

# ---------------- DASHBOARD ----------------

@app.route("/api/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    db = get_db()

    total_regions = db.execute("SELECT COUNT(*) FROM regions").fetchone()[0]
    high = db.execute("SELECT COUNT(*) FROM analysis WHERE poverty_level='High'").fetchone()[0]
    medium = db.execute("SELECT COUNT(*) FROM analysis WHERE poverty_level='Medium'").fetchone()[0]
    low = db.execute("SELECT COUNT(*) FROM analysis WHERE poverty_level='Low'").fetchone()[0]

    db.close()

    return jsonify({
        "total_regions": total_regions,
        "high": high,
        "medium": medium,
        "low": low
    })

# ---------------- REPORT EXPORT ----------------

@app.route("/api/export", methods=["GET"])
@jwt_required()
def export_csv():
    db = get_db()
    rows = db.execute("SELECT * FROM analysis").fetchall()
    db.close()

    filename = "report.csv"

    with open(filename, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["ID","Level","Score","Confidence","Date"])
        for r in rows:
            writer.writerow([
                r["id"],
                r["poverty_level"],
                r["poverty_score"],
                r["confidence"],
                r["created_at"]
            ])

    return send_file(filename, as_attachment=True)


@app.route("/api/heatmap", methods=["GET"])
@jwt_required()
def heatmap_data():

    db = get_db()

    rows = db.execute("""
        SELECT regions.latitude, regions.longitude, analysis.poverty_score
        FROM analysis
        JOIN regions ON analysis.region_id = regions.id
        WHERE regions.latitude IS NOT NULL
          AND regions.longitude IS NOT NULL
    """).fetchall()

    db.close()

    return jsonify([
        {
            "lat": r["latitude"],
            "lng": r["longitude"],
            "score": r["poverty_score"]
        } for r in rows
    ])


@app.route("/api/reports", methods=["GET"])
@jwt_required()
def filtered_reports():

    district = request.args.get("district")
    level = request.args.get("level")

    query = """
        SELECT analysis.*, regions.district
        FROM analysis
        LEFT JOIN regions ON analysis.region_id = regions.id
        WHERE 1=1
    """

    params = []

    if district:
        query += " AND regions.district=?"
        params.append(district)

    if level:
        query += " AND analysis.poverty_level=?"
        params.append(level)

    db = get_db()
    rows = db.execute(query, params).fetchall()
    db.close()

    return jsonify([dict(r) for r in rows])
# ---------------- NOTIFICATIONS ----------------

@app.route("/api/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    db = get_db()
    rows = db.execute("""
        SELECT * FROM notifications WHERE user_id=?
        ORDER BY created_at DESC
    """, (user_id,)).fetchall()
    db.close()
    return jsonify([dict(r) for r in rows])

# ---------------- PROFILE ----------------

@app.route("/api/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    db = get_db()
    user = db.execute("""
        SELECT id,name,email,organization,role
        FROM users WHERE id=?
    """, (user_id,)).fetchone()
    db.close()
    return jsonify(dict(user))

# ---------------- RUN ----------------

if __name__ == "__main__":
    app.run(debug=True)