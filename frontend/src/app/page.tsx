"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import LottiePlayer from "@/components/ui/LottiePlayer";

export default function HomePage() {
    return (
        <main className="grid md:grid-cols-2 gap-12 items-center min-h-screen px-12 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
            {/* LEFT COLUMN: Heading, Quote, Buttons */}
            <div className="flex flex-col justify-center space-y-8 text-center md:text-left relative z-10">
                {/* Animated Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-6xl font-extrabold text-blue-700 leading-tight"
                >
                    AI Trading Assistant
                </motion.h1>

                {/* Motivational Quote */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="text-xl italic text-gray-700"
                >
                    "Your path to profit just got a rocket engine !"
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="flex justify-center md:justify-start space-x-6"
                >
                    <Link
                        href="/login"
                        className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="px-6 py-3 bg-green-600 text-white rounded-md shadow-lg hover:bg-green-700 transition transform hover:scale-105"
                    >
                        Register
                    </Link>
                </motion.div>
            </div>

            {/* RIGHT COLUMN: Rocket */}
            <div className="relative flex items-center justify-center">
                {/* Rocket Guy (flies bottom-left → middle) */}
                <motion.div
                    initial={{ x: -300, y: 250, opacity: 0 }}
                    animate={{
                        x: [ -300, 10, 100 ],   // stop closer to the middle
                        y: [ 250, 50, -20 ],     // rises but not too high
                        opacity: [0, 1, 1],
                    }}
                    transition={{
                        duration: 5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 3,
                    }}
                    className="relative z-20"
                >
                    <LottiePlayer
                        src="https://lottie.host/c79af507-3068-41d2-979f-47d4a65ff23b/yYb9eiJGgF.lottie"
                        width={600}
                        height={600}
                    />
                </motion.div>
            </div>
        </main>
    );
}



















// import Link from "next/link";
//
// export default function HomePage() {
//     return (
//         <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
//             <h1 className="text-4xl font-bold mb-8">AI Trading Assistant</h1>
//
//             <div className="flex space-x-4">
//                 {/* ✅ Login Button */}
//                 <Link
//                     href="/login"
//                     className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
//                 >
//                     Login
//                 </Link>
//
//                 {/* ✅ Register Button */}
//                 <Link
//                     href="/register"
//                     className="px-6 py-3 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
//                 >
//                     Register
//                 </Link>
//             </div>
//         </main>
//     );
// }
