import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from tensorflow.keras.preprocessing import image
import tkinter as tk
from tkinter import filedialog

# ---------------- LOAD MODEL ----------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

model_files = sorted([f for f in os.listdir(MODEL_DIR) if f.endswith(".h5")])
model_path = os.path.join(MODEL_DIR, model_files[-1])

print("Loading model:", model_path)

model = tf.keras.models.load_model(model_path)

class_names = ['highpoverty', 'lowpoverty', 'mediumpoverty']

# ---------------- FILE PICKER ----------------

root = tk.Tk()
root.withdraw()

file_path = filedialog.askopenfilename(
    title="Select Poverty Image",
    filetypes=[("Image Files", "*.jpg *.jpeg *.png")]
)

if not file_path:
    print("No file selected.")
    exit()

print("Selected:", file_path)

# ---------------- PREPROCESS ----------------

IMG_SIZE = (224, 224)

img = image.load_img(file_path, target_size=IMG_SIZE)
img_array = image.img_to_array(img)
img_array = img_array / 255.0
img_array = np.expand_dims(img_array, axis=0)

# ---------------- PREDICT ----------------

predictions = model.predict(img_array)

predicted_index = int(np.argmax(predictions))
predicted_class = class_names[predicted_index]
confidence = float(np.max(predictions)) * 100

print("\n===== RESULT =====")
print("Predicted:", predicted_class)
print("Confidence: {:.2f}%".format(confidence))

# ---------------- SHOW IMAGE ----------------

plt.imshow(img)
plt.title(f"{predicted_class} ({confidence:.2f}%)")
plt.axis("off")
plt.show()