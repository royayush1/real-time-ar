"use client";
import {useState, useEffect, useRef} from 'react';
import { IoVolumeMute } from "react-icons/io5";
import { IoMdVolumeMute } from "react-icons/io";
import {motion} from 'framer-motion';

const songs = [
    {title: "Background1", url: "/music/bg.mp3"},
]

const effects = [
    {title: "Fart", url: "/music/fart.mp3"},
    {title: "Funny", url: "/music/funny.mp3"},
    {title: "Meow", url: "/music/meow.mp3"}
]

interface BackgroundMusicProps {
    effectRef: React.RefObject<HTMLAudioElement>;
}
export default function BackgroundMusic(effectRef:BackgroundMusicProps){
    const [isMuted, setIsMuted] = useState(true);
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
                
                <button onClick={toggleMute} className='text-white p-2'>
                {isMuted ? 
                    <IoVolumeMute size={20} /> : <IoMdVolumeMute size={20} />}
                </button>
            </div>
    )
}