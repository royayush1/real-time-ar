"use client"

import React, {useState} from "react";

interface AmmoOption {
    id: number;
    label: string;
    imageSrc: string;
    damage: number;
}

interface AmmoSelectorProps {
    ammoOptions: AmmoOption[]
    onSelect: (option: AmmoOption) => void;
    selectedAmmo: any
}

export default function AmmoSelector({ammoOptions, onSelect, selectedAmmo}: AmmoSelectorProps){

    return (
        <div className="bg-black bg-opacity-70 p-4 rounded">
            <h3 className="text-white font-bold mb-2">Select Ammo</h3>
            <div className="flex space-x-2">
                {ammoOptions.map((option) => (
                    <button
                        key={option?.id}
                        onClick={
                            () => 
                            {onSelect(option)}}
                        className={`${selectedAmmo != null && selectedAmmo==option ? 'bg-green-500' : '' } flex flex-col items-center hover:scale-105 transform transition-all duration-200`}>
                            <img
                                src={option?.imageSrc}
                                alt={option?.label}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white"/>
                            <span className="text-white text-xs mt-1">{option?.label}</span>
                            <span className="text-white text-xs mt-1">{option?.damage} Damage</span>

                    </button>
                ))}

            </div>

        </div>
    )
}