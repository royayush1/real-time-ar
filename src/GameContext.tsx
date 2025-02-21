"use client"
import React, { createContext, useState, useContext } from "react";

interface GameContextProps {
  ammoOptions: any[];
  setAmmoOptions: React.Dispatch<React.SetStateAction<any[]>>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [ammoOptions, setAmmoOptions] = useState<any[]>([]);
  return (
    <GameContext.Provider value={{ ammoOptions, setAmmoOptions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
