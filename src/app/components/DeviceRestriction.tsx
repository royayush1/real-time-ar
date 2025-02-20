"use client"
import { useState, useEffect } from "react";

export default function DeviceRestriction({ children }: { children: React.ReactNode }){
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkDevice();
        window.addEventListener("resize", checkDevice);
        return(() => window.removeEventListener("resize", checkDevice))
    }, [])

    if (isMobile === null){
        return null;

    }

    if (!isMobile) {
        return (
          <div className="flex items-center justify-center h-screen bg-black text-white">
            <h1 className="text-3xl text-center px-4">
              This AR Game is optimized for mobile or tablet devices.
              <br />
              Please switch to a mobile device or tablet to continue.
            </h1>
          </div>
        );
      }

    return <>{children}</>;


}