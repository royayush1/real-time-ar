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

      // Resize the cropped image to 1024x1024 as expected by the model.
    const inputTensor = tf.browser.fromPixels(imageData)
    .resizeBilinear([1024, 1024])
    .expandDims(0); 
    

    const castedTensor = tf.cast(inputTensor, 'int32');

    console.log("Casted Tensor: ", castedTensor)

    const output = await maskRcnnModel.executeAsync(castedTensor) as tf.Tensor[];

    const maskTower = output[0];

    return maskTower;


}