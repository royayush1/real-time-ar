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
}

export default function AmmoSelector({ammoOptions, onSelect}: AmmoSelectorProps){
    const [selected, setSelected] = useState<boolean>(false);

    return (
        <div className="bg-black bg-opacity-70 p-4 rounded">
            <h3 className="text-white font-bold mb-2">Select Ammo</h3>
            <div className="flex space-x-2">
                {ammoOptions.map((option) => (
                    <button
                        key={option?.id}
                        onClick={
                            () => 
                            {onSelect(option)
                             setSelected(!selected)
                            console.log("Selected",selected)}}
                        className={`${selected ? 'bg-green-500' : '' } flex flex-col items-center hover:scale-105 transform transition-all duration-200`}>
                            <img
                                src={option?.imageSrc}
                                alt={option?.label}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white"/>
                            <span className="text-white text-xs mt-1">{option?.label}</span>

                    </button>
                ))}

            </div>

        </div>
    )
}