import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import numpy as np
import tensorflow as tf
from ultralytics import YOLO
import cv2

# ------------------------------
# Load Models
# ------------------------------

poverty_model = tf.keras.models.load_model(
    "models/poverty_model_20260227_222118.h5"
)

yolo_model = YOLO("models/yolov8x.pt")

IMG_SIZE = (224, 224)
poverty_classes = ["Low", "Medium", "High"]

# ------------------------------
# Color Based Estimations
# ------------------------------

def estimate_water_percentage(image):
    img_np = np.array(image)
    hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
    lower_blue = np.array([90, 50, 50])
    upper_blue = np.array([130, 255, 255])
    mask = cv2.inRange(hsv, lower_blue, upper_blue)
    return round((np.sum(mask > 0) / mask.size) * 100, 2)

def estimate_green_percentage(image):
    img_np = np.array(image)
    hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    mask = cv2.inRange(hsv, lower_green, upper_green)
    return round((np.sum(mask > 0) / mask.size) * 100, 2)

def estimate_road_percentage(image):
    img_np = np.array(image)
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    mask = cv2.inRange(gray, 100, 180)
    return round((np.sum(mask > 0) / mask.size) * 100, 2)

# ------------------------------
# Hybrid Poverty Score
# ------------------------------

def hybrid_poverty_score(people, green, water, roads):
    score = 0
    score += people * 0.3
    score += (100 - green) * 0.2
    score += water * 0.2
    score += roads * 0.3

    if score > 80:
        return "High"
    elif score > 40:
        return "Medium"
    else:
        return "Low"

# ------------------------------
# Main Analysis
# ------------------------------

def analyze_image():

    file_path = filedialog.askopenfilename()

    if not file_path:
        return

    image = Image.open(file_path).convert("RGB")
    img_np = np.array(image)

    # -------- Poverty CNN --------
    img_resized = image.resize(IMG_SIZE)
    img_array = np.array(img_resized) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    prediction = poverty_model.predict(img_array)
    pred_class = np.argmax(prediction)
    poverty_result_cnn = poverty_classes[pred_class]

    # -------- YOLO Detection --------
    results = yolo_model(image)

    people_count = 0
    vehicle_count = 0

    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            class_name = yolo_model.names[cls_id]

            if class_name == "person":
                people_count += 1

            if class_name in ["car", "bus", "truck"]:
                vehicle_count += 1

        # Draw boxes
        img_np = r.plot()

    # -------- Environmental Metrics --------
    water_percentage = estimate_water_percentage(image)
    green_percentage = estimate_green_percentage(image)
    road_percentage = estimate_road_percentage(image)

    # -------- Hybrid Score --------
    poverty_result_hybrid = hybrid_poverty_score(
        people_count,
        green_percentage,
        water_percentage,
        road_percentage
    )

    # -------- Result --------
    result_text = f"""
CNN Poverty Level     : {poverty_result_cnn}
Hybrid Poverty Level  : {poverty_result_hybrid}

People Count          : {people_count}
Vehicle Count         : {vehicle_count}

Water Coverage        : {water_percentage} %
Green Coverage        : {green_percentage} %
Road Approximation    : {road_percentage} %
"""

    messagebox.showinfo("Geo Poverty AI Result", result_text)

    # Display image with boxes
    img_display = Image.fromarray(img_np)
    img_display = img_display.resize((450, 450))
    img_tk = ImageTk.PhotoImage(img_display)
    panel.config(image=img_tk)
    panel.image = img_tk


# ------------------------------
# UI
# ------------------------------

root = tk.Tk()
root.title("Geo Poverty AI Analyzer - Advanced")
root.geometry("600x650")

btn = tk.Button(root, text="Upload Image & Analyze", command=analyze_image)
btn.pack(pady=20)

panel = tk.Label(root)
panel.pack()

root.mainloop()