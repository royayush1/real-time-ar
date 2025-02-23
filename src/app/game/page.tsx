"use client"
import React, {useState, useRef, useEffect} from "react";
import AmmoProjectile from "../components/AmmoProjectile";
import FallingCube from "../components/FallingCube";
import Head from "next/head";
import AmmoSelector from "../components/AmmoSelector";
import { useSearchParams } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { useGameContext } from "@/GameContext";

interface FallingCubeData {
    id: number;
    initialX: number;
    fallingSpeed: number;
    isBonus: boolean;
}

export default function GamePage(){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const searchParams = useSearchParams();
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const { ammoOptions } = useGameContext();
    const [selectedAmmo, setSelectedAmmo] = useState<any | null>(null);
    const [projectiles, setProjectiles] = useState<any[]>([]);
    const [fallingCubes, setFallingCubes] = useState<FallingCubeData[]>([]);
    const [bottomY, setBottomY] = useState<number>(0);


    useEffect(() => {
            const spawnInterval = setInterval(() => {
                const newCube: FallingCubeData = {
                    id: Date.now(),
                    initialX: Math.random() * window.innerWidth,
                    fallingSpeed: Math.random() * 3 + 1,
                    isBonus: Math.random() < 0.2
                }
                setFallingCubes((prev) => {
                    const updated = [...prev, newCube];
                    console.log("Updated falling cubes:", updated);
                    return updated;
    
    
                })
            }, 2000)
            return () => clearInterval(spawnInterval)
        }, [])

        

    useEffect(() => {
        if (typeof window !== undefined){
            setBottomY(4)
        }
    }, [])

    useEffect(() => {

        console.log("bottomY: ",bottomY)

    }, [bottomY])

    const renderFallingCubes = () => {
        
        return fallingCubes.map((cube) => {
          return (
            <FallingCube
              key={cube.id}
              onHit={(currentHealth, currentY) => {
                if (selectedAmmo) {
                  const ammoOriginX = cube.initialX;
                  const ammoOriginY = bottomY;
                  const projectile = {
                    id: Date.now(),
                    startX: ammoOriginX,
                    startY: ammoOriginY,
                    targetX: cube.initialX,
                    targetY: currentY - 0.2, // or the cube's current Y (for simplicity, using bottomY)
                    damage: selectedAmmo.damage,
                    imageSrc: selectedAmmo.imageSrc,
                  };
            
                  setProjectiles((prev: any[]) => [...prev, projectile]);
                  setScore((prev) => prev + selectedAmmo.damage * (streak + 1));
                //   setSelectedAmmo(null);
                  currentHealth -= selectedAmmo.damage;
                } else {
                  currentHealth -= 5;
                  setScore((prev) => prev + 5 * (streak + 1));
                }
                // Remove the cube once hit
                setStreak((prev) => prev + 1);
                if (currentHealth <= 0){
                    setFallingCubes((prev) => prev.filter((c) => c.id !== cube.id))
                }
                return currentHealth;
              }}
              onMiss={() => {
                setLives((prev) => Math.max(prev - 1, 0));
                setStreak(0);
                setFallingCubes((prev) => prev.filter((c) => c.id !== cube.id));
              }}
              isBonus={cube.isBonus}
              hitTimeout={3000}
              initialHealth={cube.isBonus ? 150 : 100}
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

    return(
        <>
            <Head>
                <title>AR Game - Advanced Object Detection, Gamification & Ammo</title>
                <meta
                name="description"
                content="An advanced AR game integrating real-time object detection, interactive 3D targets with flying behavior, ammo-based shooting using detected objects as ammo, bonus targets, timers, lives, streak multipliers, and dynamic visual/audio feedback."
                />
            </Head>
            <div className="relative flex justify-center items-center h-screen bg-gray-900 overflow-hidden">
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
                    Score: {score} | Lives: {lives} | Streak: {streak}
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                    <AmmoSelector ammoOptions={ammoOptions} onSelect={handleAmmoSelect}/>
                </div>
                <Canvas ref={canvasRef} style={{ position:"absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex:99, borderWidth: 2}}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[5, 5, 5]} />
                    {renderFallingCubes()}
                    {renderProjectiles()}

                </Canvas>
            </div>
        </>
    )
}