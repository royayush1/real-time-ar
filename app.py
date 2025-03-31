import os
import cv2
import numpy as np
import base64
import io
from flask import Flask, request, jsonify
import mrcnn.config
import mrcnn.model
import mrcnn.visualize
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

CLASS_NAMES = ['BG', 'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train',
               'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter',
               'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear',
               'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase',
               'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat',
               'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
               'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
               'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
               'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
               'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster',
               'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
               'hair drier', 'toothbrush']


class InferenceConfig(mrcnn.config.Config):
    NAME = "coco_inference"
    GPU_COUNT = 1
    IMAGES_PER_GPU = 1
    NUM_CLASSES = len(CLASS_NAMES)

MODEL_DIR = os.getcwd()
model = mrcnn.model.MaskRCNN(mode="inference", config=InferenceConfig(), model_dir = MODEL_DIR)
weights_path = os.path.join("weights", "mask_rcnn_coco.h5")
model.load_weights(filepath=weights_path, by_name=True)
print("Mask RCNN model loaded")

def readb64(base64_string):
    sbuf = io.BytesIO(base64.b64decode(base64_string))
    pimg = np.frombuffer(sbuf.getvalue(), dtype=np.uint8)
    img = cv2.imdecode(pimg, cv2.IMREAD_COLOR)
    return img


def image_to_base64(img):
    _,buffer = cv2.imencode('.png', img)
    encoded = base64.b64encode(buffer).decode('utf-8')
    return "data:image/png;base64," + encoded

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    if 'image' not in data:
        return jsonify({'error':'No image provided'}), 400
    img_data = data['image']

    if ',' in img_data:
        img_data = img_data.split(',')[1]

    image = readb64(img_data)

    if image is None:
        return jsonify({'error': 'could not decode image'}), 400
    
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = model.detect([image_rgb], verbose=0)

    r = results[0]
    if len(r['rois']) == 0:
        return jsonify({'error:' 'No detection found'}), 400
    
    mask = r['masks'][:, :, 0]

    masked_image = image_rgb * np.expand_dims(mask, axis=-1)

    coords = np.column_stack(np.where(mask))
    if coords.size == 0:
        cropped = image_rgb
    else:
        y_min, x_min = coords.min(axis = 0)
        y_max, x_max = coords.max(axis = 0)
        cropped = masked_image[y_min:y_max+1, x_min:x_max+1]

    cropped_b64 = image_to_base64(cv2.cvtColor(cropped, cv2.COLOR_RGB2BGR))

    response = {
        'num_detections': len(r['rois']),
        'segmented_image': cropped_b64
    }


    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


