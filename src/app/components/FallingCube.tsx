"use client"

import {Canvas, useFrame} from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { Mesh } from "three"; 

export interface FallingCubeProps {
    onHit: (health: number, currentY: number) => number;
    onMiss: () => void;
    isBonus?: boolean;
    hitTimeout?: number;
    initialHealth?: number;
    initialX?: number;  
    initialY?: number;   
    fallingSpeed: number; 
    bottomY: number; 
}

export default function FallingCube({
    
    onHit,
    onMiss,
    isBonus = false,
    initialHealth = 100,
    fallingSpeed,
    bottomY
}: FallingCubeProps) {
    const meshRef = useRef<Mesh>(null!);
    
        
    const [isDestroyed, setIsDestroyed] = useState(false);
    const [health, setHealth] = useState(initialHealth);

    useEffect(() => {
        if (meshRef.current){
            meshRef.current.position.x = Math.random() * 1.5
        }   
    }, [])

    useFrame((state, delta) => {
        // if (!meshRef.current) return;

        meshRef.current.position.y -= fallingSpeed *delta

        if(meshRef.current.position.y <= -bottomY){
            onMiss();
        }
        
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
    })

    const handleClick = () => {
        if(isDestroyed && health <= 0) return;
        
        const newHealth = onHit(health, meshRef.current.position.y)

        setHealth(newHealth)
        if (newHealth <= 0){
            setIsDestroyed(true);
        }}
    

    return (
        <mesh position={[0,4,0]} ref={meshRef} onClick={handleClick}>
            <boxGeometry args={[0.25,0.25,0.25]} />
            <meshStandardMaterial color={isBonus ? "gold" : "orange"}/>
        </mesh>
    )
};



