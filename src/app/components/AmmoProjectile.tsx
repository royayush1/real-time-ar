"use client"

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

interface AmmoProjectiveProps {
    style?: React.CSSProperties;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    damage: number;
    imageSrc: string;
    onHit: () => void;
}

export default function AmmoProjectile({startX, startY, targetX, targetY, onHit, imageSrc}: AmmoProjectiveProps){
    const meshRef = useRef<THREE.Mesh>(null!);
    const [position, setPosition] = useState<[number,number,number]>([startX, startY, 0])
    const texture = useLoader(THREE.TextureLoader, imageSrc);

    useFrame(() => {
        const dx = targetX - position[0];
        const dy = targetY - position[1];
        const step = 0.25;
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

        if (Math.abs(newX - targetX) < 0.05 && Math.abs(newY - targetY) < 0.05) {
            onHit();
        }

        console.log("Position update: ", position)

    })

    // const texture = new THREE.TextureLoader().load(imageSrc);

    return(
        <mesh ref={meshRef} position={position}>
            <planeGeometry args={[0.5, 0.5]}/>
            <meshBasicMaterial map={texture} transparent={false}/>
        </mesh>
    )
}