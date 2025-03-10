import * as tf from "@tensorflow/tfjs";

let maskRcnnModel : tf.GraphModel | null = null;

export async function loadMaskRcnnModel() {
    if(!maskRcnnModel){
        maskRcnnModel = await tf.loadGraphModel("/models/maskrcnn/model.json")
    }
    return maskRcnnModel;
}

export async function getInstanceMask(imageData: ImageData): Promise<tf.Tensor>{
    if(!maskRcnnModel){
        throw new Error("Mask R CNN Model not loaded")
    }

    const inputTensor = tf.browser.fromPixels(imageData)
    .expandDims(0)
    .toFloat()
    .div(tf.scalar(255));

    const output = await maskRcnnModel.executeAsync(inputTensor) as tf.Tensor[];

    const maskTower = output[0];

    return maskTower;


}