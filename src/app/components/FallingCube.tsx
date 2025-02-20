"use client"

import {Canvas, useFrame} from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { Mesh } from "three"; 

export interface FallingCubeProps {
    style?: React.CSSProperties;
    onHit: (isBonus: Boolean, damage: number) => void;
    onMiss: () => void;
    isBonus?: boolean;
    hitTimeout?: number;
    initialHealth?: number;
    initialX: number;  
    initialY: number;   
    fallingSpeed: number; 
    bottomY: number; 
}

function FallingCubeMesh({
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


    useFrame((state, delta) => {
        if (!meshRef.current) return;

        meshRef.current.position.y += fallingSpeed * delta * 60

        if(meshRef.current.position.y >= bottomY){
            onMiss();
        }
        
    })

    const handleClick = () => {
        if(isDestroyed && health <= 0) return;
      
        const directHitDamage = isBonus ? 50 : 20;
        const newHealth = health - directHitDamage;
        setHealth(newHealth);
        if (newHealth <= 0){
            setIsDestroyed(true);
            onHit(isBonus, directHitDamage);
        }

        }
    

    return (
        <mesh ref={meshRef} onClick={handleClick}>
            <boxGeometry args={[1,1,1]} />
            <meshStandardMaterial color={isBonus ? "gold" : "orange"}/>
        </mesh>
    )
};

export default function FallingCube(props: FallingCubeProps){
    return(
        <div style = {props.style}>
            <Canvas style={{ width: "100%", height: "100%" }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <FallingCubeMesh {...props} />
            </Canvas>
        </div>
    )
}

