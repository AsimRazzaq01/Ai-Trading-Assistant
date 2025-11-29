"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import LottiePlayer from "@/components/ui/LottiePlayer";

export default function HomePage() {
    const { theme, toggleTheme } = useTheme();
    
    return (
        <main className={`relative grid md:grid-cols-2 gap-12 items-center min-h-screen px-12 overflow-hidden transition-colors duration-500 ${
            theme === "dark"
                ? "bg-gradient-to-b from-black via-gray-950 to-black"
                : "bg-gradient-to-b from-gray-50 to-gray-100"
        }`}>
            {/* Dark Mode Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={toggleTheme}
                    className={`p-3 rounded-xl transition-all shadow-lg ${
                        theme === 'dark'
                            ? 'bg-white/10 border border-white/20 hover:bg-white/15 text-white'
                            : 'bg-white/90 border border-gray-200 hover:bg-white text-[#2d3748] shadow-md'
                    }`}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? (
                        <Sun className="w-6 h-6" />
                    ) : (
                        <Moon className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* === VIEWPORT OVERLAY (moon + rocket) === */}
            <div className="pointer-events-none absolute inset-0 z-0">
                {/* 🌙 Moon — new animation */}
                <motion.div
                    className="absolute top-0 right-8"
                >
                    <div className={`absolute inset-0 blur-2xl rounded-full scale-110 transition-colors ${
                        theme === "dark"
                            ? "bg-gradient-to-b from-white/10 to-transparent"
                            : "bg-gradient-to-b from-black/25 to-transparent"
                    }`} />
                    <LottiePlayer
                        src="https://lottie.host/7186611e-aa0b-427c-b627-e61080a0425a/JsEPffT1cf.lottie"
                        width={300}
                        height={300}
                    />
                </motion.div>


                {/* 🚀 Rocket — bottom-left → center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        initial={{ x: "-60vw", y: "55vh", opacity: 0 }}
                        animate={{ x: 0, y: 0, opacity: 1 }}
                        transition={{ duration: 2.8, ease: "easeInOut" }}
                    >
                        <LottiePlayer
                            src="https://lottie.host/c79af507-3068-41d2-979f-47d4a65ff23b/yYb9eiJGgF.lottie"
                            width={500}
                            height={500}
                        />
                    </motion.div>
                </div>
            </div>

            {/* LEFT COLUMN: Title, Subtitle, Quote, Buttons */}
            <div className="flex flex-col justify-center space-y-5 text-center md:text-left relative z-10 -mt-20 sm:-mt-24 md:-mt-28 lg:-mt-36">

                {/* 🪙 Project Name */}
                <motion.h1
                    initial={{ opacity: 0, y: -60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-[4.5rem] sm:text-[5.5rem] md:text-[6rem] lg:text-[6.5rem] xl:text-[7rem] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-green-500 bg-[length:200%_200%] animate-gradient-move leading-none whitespace-nowrap drop-shadow-[0_4px_6px_rgba(59,130,246,0.25)]"
                >
                    PROFIT PATH
                </motion.h1>


                {/* Subheading */}
                <motion.h2
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className={`text-4xl md:text-5xl font-bold leading-snug transition-colors ${
                        theme === "dark" ? "text-blue-400" : "text-blue-700"
                    }`}
                >
                    Your very own Personal
                </motion.h2>

                <motion.h2
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className={`text-4xl md:text-5xl font-bold leading-snug transition-colors ${
                        theme === "dark" ? "text-blue-400" : "text-blue-700"
                    }`}
                >
                    AI Trading Assistant
                </motion.h2>

                {/* Taglines */}

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className={`text-lg md:text-xl italic transition-colors ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                >
                    Next stop — the moon!
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="flex justify-center md:justify-start space-x-6 pt-2"
                >
                    <Link
                        href="/login"
                        className={`px-8 py-3.5 text-lg text-white rounded-md shadow-lg transition transform hover:scale-105 ${
                            theme === "dark"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className={`px-8 py-3.5 text-lg text-white rounded-md shadow-lg transition transform hover:scale-105 ${
                            theme === "dark"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                        Register
                    </Link>
                </motion.div>
            </div>

            <div />
        </main>
    );
}














// "use client";
//
// import { motion } from "framer-motion";
// import Link from "next/link";
// import LottiePlayer from "@/components/ui/LottiePlayer";
//
// export default function HomePage() {
//     return (
//         <main className="grid md:grid-cols-2 gap-12 items-center min-h-screen px-12 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
//             {/* LEFT COLUMN: Heading, Quote, Buttons */}
//             <div className="flex flex-col justify-center space-y-8 text-center md:text-left relative z-10">
//                 {/* Animated Heading */}
//                 <motion.h1
//                     initial={{ opacity: 0, y: -50 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 1 }}
//                     className="text-6xl font-extrabold text-blue-700 leading-tight"
//                 >
//                     AI Trading Assistant
//                 </motion.h1>
//
//                 {/* Motivational Quote */}
//                 <motion.p
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.6, duration: 1 }}
//                     className="text-xl italic text-gray-700"
//                 >
//                     "Your path to profit just got a rocket engine !"
//                 </motion.p>
//
//                 {/* Buttons */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 1, duration: 1 }}
//                     className="flex justify-center md:justify-start space-x-6"
//                 >
//                     <Link
//                         href="/login"
//                         className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
//                     >
//                         Login
//                     </Link>
//                     <Link
//                         href="/register"
//                         className="px-6 py-3 bg-green-600 text-white rounded-md shadow-lg hover:bg-green-700 transition transform hover:scale-105"
//                     >
//                         Register
//                     </Link>
//                 </motion.div>
//             </div>
//
//             {/* RIGHT COLUMN: Rocket */}
//             <div className="relative flex items-center justify-center">
//                 {/* Rocket Guy (flies bottom-left → middle) */}
//                 <motion.div
//                     initial={{ x: -300, y: 250, opacity: 0 }}
//                     animate={{
//                         x: [ -300, 10, 100 ],   // stop closer to the middle
//                         y: [ 250, 50, -20 ],     // rises but not too high
//                         opacity: [0, 1, 1],
//                     }}
//                     transition={{
//                         duration: 5,
//                         ease: "easeInOut",
//                         repeat: Infinity,
//                         repeatDelay: 3,
//                     }}
//                     className="relative z-20"
//                 >
//                     <LottiePlayer
//                         src="https://lottie.host/c79af507-3068-41d2-979f-47d4a65ff23b/yYb9eiJGgF.lottie"
//                         width={600}
//                         height={600}
//                     />
//                 </motion.div>
//             </div>
//         </main>
//     );
// }













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
