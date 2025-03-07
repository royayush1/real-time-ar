"use client"

import { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import Head from "next/head";
import { motion } from "framer-motion";
import FallingCube from "../components/FallingCube";
import AmmoSelector from "../components/AmmoSelector";
import AmmoProjectile from "../components/AmmoProjectile";
import { label, pre } from "framer-motion/client";
import Link from "next/link";
import { useGameContext } from "@/GameContext";

interface Detection {
    class: string;
    bbox: [number, number, number, number]
}

const defaultDamageMapping: {[key: string]: number} = {
    person: 30,
    box: 10,
    pet: 15,
    default: 5,
};


export default function ARGamePage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [detections, setDetections] = useState<Detection[]>([]);
    const { ammoOptions, setAmmoOptions } = useGameContext();
    const [selectedAmmo, setSelectedAmmo] = useState<any | null>(null);
    const [projectiles, setProjectiles] = useState<any[]>([]);
    const [pressStart, setPressStart] = useState<number | null>(null);
    const [pressPos, setPressPos] = useState<{x: number, y: number} | null>(null);
   

    function captureSnapshot(video: HTMLVideoElement, bbox: [number, number, number, number]){
        const [x, y, width, height] = bbox;
        const offScreenCanvas = document.createElement("canvas");
        offScreenCanvas.width = width;
        offScreenCanvas.height = height;
        const ctx = offScreenCanvas.getContext("2d");
        if(ctx){
            ctx.drawImage(video, x, y, width, height, 0, 0, width, height);
            return offScreenCanvas.toDataURL("image/png")
        }
        return "";
    }

    useEffect(() => {
        async function setupCamera(){
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: "environment"}}});
                    if (videoRef.current){
                        videoRef.current.srcObject = stream;
                        return new Promise<void>((resolve) => {
                            videoRef.current!.onloadedmetadata = () => {
                                videoRef.current!.play();
                                resolve();
                            }
                        })
                    }
                } catch(error) {
                    console.error("Error Accessing Webcam", error);

                }
            }
        }
        setupCamera();
    }, []);

    useEffect(() => {
        async function loadModel() {
            const loadedModel = await cocoSsd.load();
            setModel(loadedModel);
        }
        loadModel()
    }, [])

    useEffect(() => {
        let animationFrameId: number;
        async function detectFrame() {
            if (videoRef.current && canvasRef.current && model && videoRef.current.videoWidth > 0 &&
                videoRef.current.videoHeight > 0){
                const predictions = await model.detect(videoRef.current);
                setDetections(predictions as Detection[]);
                drawPredictions(predictions);

            }
            animationFrameId = requestAnimationFrame(detectFrame);
        }
        if (model) {
            detectFrame();
        }
        return () => cancelAnimationFrame(animationFrameId);
    }, [model]);

    const drawPredictions = (predictions: cocoSsd.DetectedObject[]) => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas){
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                predictions.forEach((prediction) => {
                    const [x, y, width, height] = prediction.bbox;
                    ctx.strokeStyle = "#00FFFF";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, width, height);
                    ctx.font = "16px Arial";
                    ctx.fillStyle = "#00FFFF";
                    const text = prediction.class;
                    const textWidth = ctx.measureText(text).width;
                    const textHeight = 16;
                    ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
                    ctx.fillStyle = "#000000";
                    ctx.fillText(text, x+2, y+textHeight);
                })
            }
        }

    }

    const handleAmmoSelect = (option: any) => {
        console.log("Option", option)
        if (selectedAmmo === option){
            setSelectedAmmo(null)
        } else {
            setSelectedAmmo(option);
        }
    }

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setPressStart(Date.now());
        setPressPos({x: e.clientX, y: e.clientY})
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (pressStart && pressPos && videoRef.current){
            const duration = Date.now() - pressStart;
            if (duration >= 500) { // Long press threshold (500ms)
                const videoRect = videoRef.current.getBoundingClientRect();
                const pointerX = e.clientX - videoRect.left;
                const pointerY = e.clientY - videoRect.top;
                // Check if the pointer is inside any detection's bounding box
                for (const det of detections) {
                  const [x, y, width, height] = det.bbox;
                  if (
                    pointerX >= x &&
                    pointerX <= x + width &&
                    pointerY >= y &&
                    pointerY <= y + height
                  ) {
                    const snapshot = captureSnapshot(videoRef.current, det.bbox);
                    const newAmmo = {
                        id: det.class + Date.now(),
                        label: det.class,
                        imageSrc: snapshot || `/images/${det.class}.png`,
                        damage: defaultDamageMapping[det.class] || defaultDamageMapping["default"],
                      };
                    setSelectedAmmo(newAmmo);
                    setAmmoOptions([...ammoOptions, newAmmo])
                    break; 
                  }
                }
              }
            }
            setPressStart(null);
            setPressPos(null);

        }
    

    

    return(
        <>
            <Head>
                <title>AR Game - Advanced Object Detection, Gamification & Ammo</title>
                <meta
                name="description"
                content="An advanced AR game integrating real-time object detection, interactive 3D targets with flying behavior, ammo-based shooting using detected objects as ammo, bonus targets, timers, lives, streak multipliers, and dynamic visual/audio feedback."
                />
            </Head>
            <div className="relative flex justify-center items-center h-screen bg-gray-900 overflow-hidden"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}>
                <div className="absolute top-0 z-20 p-6 border-2">
                    <h1 className="text-white text-base text-center">Scan Objects to use as ammo. Different types of objects do different damage. When you're ready to play, click Ready!</h1>
                </div>
                <div className="absolute bottom-4 right-4 z-20">
                    <Link href="/game" className="text-white font-bold text-2xl hover:text-purple-600">Ready!</Link>
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                    <AmmoSelector ammoOptions={ammoOptions} onSelect={handleAmmoSelect} selectedAmmo={selectedAmmo}/>
                </div>
                <video
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    muted
                    playsInline/>
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"/>
            </div>
        </>
    )



}