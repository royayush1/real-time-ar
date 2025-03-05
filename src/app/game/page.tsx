"use client"
import React, {useState, useRef, useEffect} from "react";
import AmmoProjectile from "../components/AmmoProjectile";
import FallingCube from "../components/FallingCube";
import Head from "next/head";
import AmmoSelector from "../components/AmmoSelector";
import { useSearchParams } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { useGameContext } from "@/GameContext";
import { IoVolumeMute } from "react-icons/io5";
import { IoMdVolumeMute } from "react-icons/io";
import {motion} from 'framer-motion';



interface FallingCubeData {
    id: number;
    initialX: number;
    fallingSpeed: number;
    isBonus: boolean;
}

interface BackgroundMusicProps {
    isMuted: boolean,
    setIsMuted: (isMuted: boolean) => void
}

const songs = [
    {title: "Background1", url: "/music/bg.mp3"},
]

const effects = [
    {title: "Fart", url: "/music/fart.mp3"},
    {title: "Funny", url: "/music/funny.mp3"},
    {title: "Meow", url: "/music/meow.mp3"}
]

const BackgroundMusic: React.FC<any> = ({isMuted, setIsMuted} : BackgroundMusicProps) => {
    
    const [isLooping, setIsLooping] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
                if (audioRef.current){
                    audioRef.current.load();
                }

                

                
            }, []);

    useEffect(() => {
                if (audioRef.current){
                    audioRef.current.muted = isMuted;
                }
                
              
                }, [isMuted])

    const toggleMute = () => {
                if (audioRef.current){
                    setIsMuted(!isMuted)
                }
                
            
            };

    return(
        
            <div className='fixed bottom-4 right-4 z-50'>
                <audio 
                    ref={audioRef}
                    src={songs[0].url}
                    autoPlay
                    loop={isLooping}
                    muted={true}  
                    >
                    
                    Your browser does not support the audio element
                        
                </audio>
                {/* <audio 
                    ref={effectRef}
                    src={effects[0].url}
                    loop={false}
                    muted={true}  
                    >
                    
                    Your browser does not support the audio element
                        
                </audio> */}
                
                <button onClick={toggleMute} className='text-white p-2'>
                {isMuted ? 
                    <IoVolumeMute size={20} /> : <IoMdVolumeMute size={20} />}
                </button>
            </div>
    )
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
    const [isMuted, setIsMuted] = useState(true);
    const [bottomY, setBottomY] = useState<number>(0);
    const effectRef = useRef<HTMLAudioElement>(null);

   useEffect(() => {
    if (effectRef.current){
        effectRef.current.load()
    }
   }, [])

   useEffect(() => {
    if (effectRef.current){
        effectRef.current.muted = isMuted;
    }
    
  
    }, [isMuted])

    


    useEffect(() => {
            const spawnInterval = setInterval(() => {
                const newCube: FallingCubeData = {
                    id: Date.now(),
                    initialX: Math.random() * (1.5 - (-1.5)) + (-1.5),
                    fallingSpeed: Math.random() * 3 + 1,
                    isBonus: Math.random() < 0.2
                }
                console.log("new cube initial X:", newCube.initialX)
                setFallingCubes((prev) => {
                    const updated = [...prev, newCube];
                    console.log("Updated falling cubes:", updated);
                    return updated;
    
    
                })
            }, 2000)
            return () => clearInterval(spawnInterval)
        }, [])

    useEffect(() => {
        console.log("Ammo Options", ammoOptions)
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
              initialX={cube.initialX}
              onHit={(currentHealth, currentY, setHealth) => {
                console.log("On hit working")
                if (selectedAmmo) {
                    console.log("Selected ammo: ", selectedAmmo)
                  const ammoOriginX = cube.initialX;
                  const ammoOriginY = -bottomY;
                  const projectile = {
                    id: Date.now(),
                    startX: ammoOriginX,
                    startY: ammoOriginY,
                    targetX: cube.initialX,
                    targetY: currentY - 0.2, // or the cube's current Y (for simplicity, using bottomY)
                    damage: selectedAmmo.damage,
                    imageSrc: selectedAmmo.imageSrc,
                    targetHealth: currentHealth,
                    targetID: cube.id,
                    setTargetHealth: setHealth,
                  };
                  
                  const soundtrack = Math.floor(Math.random() * 3)
                  if (effectRef.current){
                    console.log("Soundtrack", soundtrack)
                    console.log("Effect soundtrack: ", effects[soundtrack].url )
                    effectRef.current.src = effects[soundtrack].url
                    effectRef.current.play()
                    console.log("Should have played")
                    
                  }
                  setProjectiles((prev: any[]) => [...prev, projectile]);
                  
                //   setSelectedAmmo(null);
                  
                } else {
                 console.log("null Selected ammo: ", selectedAmmo)
                  currentHealth -= 5;
                  setScore((prev) => prev + 5 * (streak + 1));
                  // Remove the cube once hit
                  setStreak((prev) => prev + 1);
                  if (currentHealth <= 0){
                    setFallingCubes((prev) => prev.filter((c) => c.id !== cube.id))
                }
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
              initialHealth={cube.isBonus ? 60 : 30}
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
            console.log("Projectile shot : ", proj.damage, "damage, ID: ",proj.id  )
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
                    targetHealth={proj.targetHealth}
                    onHit={(targetHealth) => {
                        setProjectiles((prev) => prev.filter((p) => p.id !== proj.id));
                        setScore((prev) => prev + proj.damage * (streak + 1));
                        targetHealth -= proj.damage;
                        proj.setTargetHealth(targetHealth)
                        setStreak((prev) => prev + 1);
                        if (targetHealth <= 0){
                            setFallingCubes((prev) => prev.filter((c) => c.id !== proj.targetID))
                        }
                    }}/>
            )
        })
    }

    const handleAmmoSelect = (option: any) => {
        console.log("Option", option)
        if (selectedAmmo === option){
            setSelectedAmmo(null)
        } else {
            setSelectedAmmo(option);
        }
    }

    useEffect(() => {
        console.log("Selected Ammo: ",selectedAmmo)
    }, [selectedAmmo])

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
                <div className="absolute bottom-4 left-4 z-[999]">
                    <AmmoSelector ammoOptions={ammoOptions} onSelect={handleAmmoSelect}/>
                </div>
                <Canvas ref={canvasRef} style={{ position:"absolute", top: 0, left: 0, width: "100%", height: "100%", borderWidth: 2}}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[5, 5, 5]} />
                    {renderFallingCubes()}
                    {renderProjectiles()}

                </Canvas>
                <audio 
                    ref={effectRef}
                    src={effects[0].url}
                    loop={false}
                    muted={true}  
                    >
                    
                    Your browser does not support the audio element
                        
                </audio>
                <BackgroundMusic isMuted={isMuted} setIsMuted={setIsMuted}/>
            </div>
        </>
    )
}