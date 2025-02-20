"use client"

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface AmmoProjectiveProps {
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    damage: number;
    imageSrc: string;
    onHit: () => void;
}

function MovingProjectile({startX, startY, targetX, targetY, onHit, imageSrc}: AmmoProjectiveProps){
    const meshRef = useRef<THREE.Mesh>(null!);
    const [position, setPosition] = useState<[number,number,number]>([startX, startY, 0])

    useFrame(() => {
        const dx = targetX - position[0];
        const dy = targetY - position[1];
        const step = 20;
        let newX = position[0];
        let newY = position[1];

        if (Math.abs(dx) > step){
            newX += step * Math.sign(dx);
        } else {
            newX = targetX;
        }
        if (Math.abs(dy) > step){
            newY += step * Math.sign(dy);
        } else {
            newY = targetY;
        }
        setPosition([newX, newY, 0]);

        if (Math.abs(newX - targetX) < 1 && Math.abs(newY - targetY) < 1) {
            onHit();
        }

    })

    const texture = new THREE.TextureLoader().load(imageSrc);

    return(
        <mesh ref={meshRef} position={position}>
            <planeGeometry args={[0.5, 0.5]}/>
            <meshBasicMaterial map={texture} transparent={true}/>
        </mesh>
    )
}

interface ProjectileWrapperProps extends AmmoProjectiveProps{
    style: React.CSSProperties;
}

export default function AmmoProjectile({ style, startX, startY, targetX, targetY, damage, imageSrc, onHit }: ProjectileWrapperProps){
    return(
        <div style={style}>
            <Canvas style={{ width: "100%", height: "100%" }}>
                <ambientLight intensity={0.5} />
                <MovingProjectile startX={startX} startY={startY} targetX={targetX} targetY={targetY} onHit={onHit} imageSrc={imageSrc} damage={damage} />
            </Canvas>
        </div>
    )
}