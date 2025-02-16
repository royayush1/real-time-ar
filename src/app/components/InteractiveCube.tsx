"use client"

import {Canvas, useFrame} from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { Mesh } from "three"; 

export interface InteractiveCubeProps {
    style?: React.CSSProperties;
    onHit: (isBonus: Boolean, damage: number) => void;
    onMiss: () => void;
    isBonus?: boolean;
    hitTimeout?: number;
    initialHealth?: number;
}

function RotatingInteractiveCube({
    onHit,
    onMiss,
    isBonus = false,
    hitTimeout = 3000,
    initialHealth = 100,
}: InteractiveCubeProps) {
    const meshRef = useRef<Mesh>(null!);
    const [isDestroyed, setIsDestroyed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(hitTimeout);
    const [health, setHealth] = useState(initialHealth);

    useEffect(() => {
        if(isDestroyed) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 100){
                    clearInterval(interval)
                    onMiss();
                    return 0;
                }
                return prev-100;
            })
        }, 100);
        return () => clearInterval(interval);
    }, [isDestroyed, hitTimeout, onMiss]);

    useFrame(() => {
        if (meshRef.current){
            meshRef.current.rotation.x += 0.01;
            meshRef.current.rotation.y += 0.01;
            const scaleFactor = 1 + (1 - timeLeft / hitTimeout) * 0.5;
            meshRef.current.scale.set(isDestroyed ? scaleFactor * 1.5 : scaleFactor, isDestroyed ? scaleFactor * 1.5 : scaleFactor, isDestroyed ? scaleFactor * 1.5 : scaleFactor)
        }
    })

    const handleClick = () => {
        if(!isDestroyed && health > 0){
            const directHitDamage = isBonus ? 50 : 20;
            const newHealth = health - directHitDamage;
            setHealth(newHealth);
            if (newHealth <= 0){
                setIsDestroyed(true);
                onHit(isBonus, directHitDamage);
            }

        }
    };

    return (
        <mesh ref={meshRef} onClick={handleClick}>
            <boxGeometry args={[1,1,1]} />
            <meshStandardMaterial color={isBonus ? "gold" : "orange"}/>
        </mesh>
    )
        
};

export default function InteractiveCube({style, onHit, onMiss, isBonus, hitTimeout, initialHealth} : InteractiveCubeProps){
    return(
        <div style={style}>
            <Canvas style={{width: "100%", height: "100%"}}>
                <ambientLight intensity={0.5}/>
                <pointLight position={[10, 10, 10]}/>
                <RotatingInteractiveCube onHit={onHit} onMiss={onMiss} isBonus={isBonus} hitTimeout={hitTimeout} initialHealth={initialHealth}/> 
            </Canvas>
        </div>
    )
}

