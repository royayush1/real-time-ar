"use client"
import Image from "next/image";
import Head from "next/head";
import {motion} from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>
          AR Game - Advanced Object Detection, Gamification & Ammo
        </title>
        <meta
          name="description"
          content="An advanced AR game integrating real-time object detection, interactive 3D targets with flying behavior, ammo-based shooting using detected objects as ammo, bonus targets, timers, lives, streak multipliers, and dynamic visual/audio feedback."
        />
      </Head>
      <div className="relative flex justify-center items-center h-screen bg-gray-900 overflow-hidden">
        <Link href="/ar-detection" className="text-white font-bold text-2xl hover:text-purple-600">Start now!</Link>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-4 text-white p-4 bg-black bg-opacity-50 rounded"
        >
          AR Gamification: Shoot targets using your ammo!
        </motion.div>
      </div>
    </>
  );
}
