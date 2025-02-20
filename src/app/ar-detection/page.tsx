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

interface FallingCubeData {
    id: number;
    initialX: number;
    fallingSpeed: number;
    isBonus: boolean;
}

export default function ARGamePage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [detections, setDetections] = useState<Detection[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [ammoOptions, setAmmoOptions] = useState<any[]>([]);
    const [selectedAmmo, setSelectedAmmo] = useState<any | null>(null);
    const [projectiles, setProjectiles] = useState<any[]>([]);
    const [pressStart, setPressStart] = useState<number | null>(null);
    const [pressPos, setPressPos] = useState<{x: number, y: number} | null>(null);
    const [fallingCubes, setFallingCubes] = useState<FallingCubeData[]>([])

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

    useEffect(() => {
        const spawnInterval = setInterval(() => {
            const newCube: FallingCubeData = {
                id: Date.now(),
                initialX: Math.random() * window.innerWidth,
                fallingSpeed: Math.random() * 2 + 1,
                isBonus: Math.random() < 0.2
            }
            setFallingCubes((prev) => [...prev, newCube])
        }, 2000)
        return () => clearInterval(spawnInterval)
    }, [])

    const renderFallingCubes = () => {
        const bottomY = window.innerHeight - 50; // the line at the bottom
        return fallingCubes.map((cube) => {
          const style: React.CSSProperties = {
            position: "absolute",
            left: cube.initialX,
            top: -50, // start above the screen
            width: 50,
            height: 50,
          };
          return (
            <FallingCube
              key={cube.id}
              style={style}
              onHit={(bonus, damage) => {
                if (selectedAmmo) {
                  const ammoOriginX = 50;
                  const ammoOriginY = window.innerHeight - 50;
                  const projectile = {
                    id: Date.now(),
                    startX: ammoOriginX,
                    startY: ammoOriginY,
                    targetX: cube.initialX,
                    targetY: bottomY, // or the cube's current Y (for simplicity, using bottomY)
                    damage: selectedAmmo.damage,
                    imageSrc: selectedAmmo.imageSrc,
                  };
                  setProjectiles((prev: any[]) => [...prev, projectile]);
                  setSelectedAmmo(null);
                } else {
                  setScore((prev) => prev + damage * (streak + 1));
                  setStreak((prev) => prev + 1);
                }
                // Remove the cube once hit
                setFallingCubes((prev) => prev.filter((c) => c.id !== cube.id));
              }}
              onMiss={() => {
                setLives((prev) => Math.max(prev - 1, 0));
                setStreak(0);
                setFallingCubes((prev) => prev.filter((c) => c.id !== cube.id));
              }}
              isBonus={cube.isBonus}
              hitTimeout={3000}
              initialHealth={100}
              initialX={cube.initialX}
              initialY={-50}
              fallingSpeed={cube.fallingSpeed}
              bottomY={bottomY}
            />
          );
        });
      };

    const renderProjectiles = () => {
        return projectiles.map((proj) => {
            const style: React.CSSProperties = {
                position: "absolute",
                left: 0,
                top: 0,
                width: 50,
                height: 50
            };
            return (
                <AmmoProjectile
                    key={proj.id}
                    style={style}
                    startX={proj.startX}
                    startY={proj.startY}
                    targetX={proj.targetX}
                    targetY={proj.targetY}
                    damage={proj.damage}
                    imageSrc={proj.imageSrc}
                    onHit={() => {
                        setScore((prev) => prev + proj.damage);
                        setProjectiles((prev) => prev.filter((p) => p.id !== proj.id));
                    }}/>
            )
        })
    }

    const handleAmmoSelect = (option: any) => {
        setSelectedAmmo(option);
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
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
                    Score: {score} | Lives: {lives} | Streak: {streak}
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                    <AmmoSelector ammoOptions={ammoOptions} onSelect={handleAmmoSelect}/>
                </div>
                <video
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    muted
                    playsInline/>
                <canvas ref={canvasRef} className="absolute top-0 left-0"/>
                <div className="absolute top-0 left-0 w-full h-full">{renderFallingCubes()}</div>
                <div className="absolute top-0 left-0 w-full h-full">{renderProjectiles()}</div>
            </div>
        </>
    )



}