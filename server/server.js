// server.js
const express = require('express');
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' })); 


let model;
const MODEL_PATH = path.join(__dirname,'..', 'public', 'models', 'maskrcnn', 'model.json');

(async () => {
  try {
    console.log('Loading model from:', MODEL_PATH);
    model = await tf.loadGraphModel('file://' + MODEL_PATH);
    console.log('Model loaded successfully.');
  } catch (error) {
    console.error('Error loading model:', error);
  }
})();

async function decodeBase64Image(base64Str) {
  if (base64Str.indexOf('base64,') >= 0) {
    base64Str = base64Str.split('base64,')[1];
  }
  const buffer = Buffer.from(base64Str, 'base64');
  return await Jimp.read(buffer);
}

async function encodeImageToBase64(image) {
  return await image.getBase64Async(Jimp.MIME_PNG);
}

app.post('/predict', async (req, res) => {
  try {
    const { image: imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    const jimpImage = await decodeBase64Image(imageBase64);
    jimpImage.resize(1024, 1024);
    
    const imageBuffer = await jimpImage.getBufferAsync(Jimp.MIME_PNG);
    let inputTensor = tf.node.decodeImage(imageBuffer, 3);
    inputTensor = inputTensor.expandDims(0).toFloat().div(tf.scalar(255)); 
    
    const outputs = await model.executeAsync(inputTensor);
    let maskTensor = outputs[0];
    maskTensor = maskTensor.squeeze();

    if (maskTensor.shape.length === 3) {
      maskTensor = maskTensor.slice([0, 0, 0], [-1, -1, 1]).squeeze();
    }
    
    const binaryMask = maskTensor.greater(tf.scalar(0.5));
    const maskData = await binaryMask.array();

    const maskedImage = jimpImage.clone();
    maskedImage.scan(0, 0, maskedImage.bitmap.width, maskedImage.bitmap.height, function(x, y, idx) {
      const m = maskData[y][x] ? 255 : 0;
      this.bitmap.data[idx + 0] = (this.bitmap.data[idx + 0] * m) / 255;
      this.bitmap.data[idx + 1] = (this.bitmap.data[idx + 1] * m) / 255;
      this.bitmap.data[idx + 2] = (this.bitmap.data[idx + 2] * m) / 255;
    });
    
    let xMin = 1024, yMin = 1024, xMax = 0, yMax = 0;
    for (let y = 0; y < 1024; y++) {
      for (let x = 0; x < 1024; x++) {
        if (maskData[y][x]) {
          if (x < xMin) xMin = x;
          if (y < yMin) yMin = y;
          if (x > xMax) xMax = x;
          if (y > yMax) yMax = y;
        }
      }
    }
    
    let cropped;
    if (xMax > xMin && yMax > yMin) {
      cropped = maskedImage.clone().crop(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
    } else {
      cropped = maskedImage;
    }
    
    const segmentedImageB64 = await encodeImageToBase64(cropped);
    
    res.json({
      num_detections: 1,
      segmented_image: segmentedImageB64
    });
  } catch (error) {
    console.error("Error during prediction:", error);
    res.status(500).json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
