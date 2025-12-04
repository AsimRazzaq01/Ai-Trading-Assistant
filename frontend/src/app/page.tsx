"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import LottiePlayer from "@/components/ui/LottiePlayer";

export default function HomePage() {
    const { theme, toggleTheme } = useTheme();
    
    return (
        <main className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
            theme === "dark"
                ? "bg-gradient-to-b from-blue-950 via-black to-black"
                : "bg-gradient-to-b from-white to-[#f0f4ff]"
        }`}>
            {/* Financial Background Elements - Responsive */}
            <div className={`absolute inset-0 pointer-events-none z-0 ${
                theme === "dark" ? "opacity-[0.05]" : "opacity-[0.03]"
            }`}>
                {/* Candlestick Pattern - Hidden on mobile, visible on larger screens */}
                <svg className="hidden sm:block absolute top-20 left-4 md:left-10 w-24 h-24 md:w-32 md:h-32" viewBox="0 0 100 100" fill="none">
                    <rect x="20" y="30" width="8" height="40" fill="currentColor" className={theme === "dark" ? "text-green-400" : "text-green-600"} />
                    <rect x="35" y="20" width="8" height="50" fill="currentColor" className={theme === "dark" ? "text-red-400" : "text-red-600"} />
                    <rect x="50" y="40" width="8" height="30" fill="currentColor" className={theme === "dark" ? "text-green-400" : "text-green-600"} />
                    <rect x="65" y="25" width="8" height="45" fill="currentColor" className={theme === "dark" ? "text-red-400" : "text-red-600"} />
                    <rect x="80" y="35" width="8" height="35" fill="currentColor" className={theme === "dark" ? "text-green-400" : "text-green-600"} />
                </svg>
                {/* Line Graph - Hidden on mobile, visible on tablet+ */}
                <svg className="hidden md:block absolute bottom-32 right-10 lg:right-20 w-32 h-20 lg:w-40 lg:h-24" viewBox="0 0 200 120" fill="none">
                    <polyline 
                        points="10,100 30,80 50,60 70,70 90,40 110,50 130,30 150,45 170,25 190,35" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        fill="none"
                        className={theme === "dark" ? "text-blue-400" : "text-blue-600"}
                    />
                </svg>
                {/* Additional small candlesticks - Hidden on mobile */}
                <svg className="hidden lg:block absolute top-1/2 right-1/4 w-24 h-24" viewBox="0 0 80 80" fill="none">
                    <rect x="15" y="25" width="6" height="30" fill="currentColor" className={theme === "dark" ? "text-green-400" : "text-green-600"} />
                    <rect x="25" y="20" width="6" height="35" fill="currentColor" className={theme === "dark" ? "text-red-400" : "text-red-600"} />
                    <rect x="35" y="30" width="6" height="25" fill="currentColor" className={theme === "dark" ? "text-green-400" : "text-green-600"} />
                    <rect x="45" y="15" width="6" height="40" fill="currentColor" className={theme === "dark" ? "text-red-400" : "text-red-600"} />
                </svg>
            </div>

            {/* Theme Toggle Button - Responsive positioning */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
                <button
                    onClick={toggleTheme}
                    className={`p-2.5 sm:p-3 rounded-xl transition-all shadow-lg touch-manipulation ${
                        theme === 'dark'
                            ? 'bg-white/10 border border-white/20 hover:bg-white/15 text-white'
                            : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm'
                    }`}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                        <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                </button>
            </div>

            {/* Main Content Grid - Responsive layout */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center min-h-screen px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16 pt-16 sm:pt-20 md:pt-24 pb-32 sm:pb-40 md:pb-24">
                {/* LEFT COLUMN: Title, Subtitle, Quote, Buttons */}
                <div className="flex flex-col justify-center space-y-4 sm:space-y-5 md:space-y-6 text-center md:text-left relative z-10 order-2 md:order-1">
                    {/* 🪙 Project Name - Responsive text sizes */}
                    <motion.h1
                        initial={{ opacity: 0, y: -60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="text-[3rem] xs:text-[3.5rem] sm:text-[4.5rem] md:text-[5rem] lg:text-[6rem] xl:text-[6.5rem] 2xl:text-[7rem] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-green-500 bg-[length:200%_200%] animate-gradient-move leading-none relative"
                        style={{
                            textShadow: theme === "dark" 
                                ? "0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.2), 0 4px 6px rgba(59, 130, 246, 0.25)"
                                : "0 0 15px rgba(59, 130, 246, 0.2), 0 0 30px rgba(59, 130, 246, 0.15), 0 4px 6px rgba(59, 130, 246, 0.2)"
                        }}
                    >
                        PROFIT PATH
                    </motion.h1>

                    {/* Subheading - Responsive */}
                    <motion.h2
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight transition-colors ${
                            theme === "dark" ? "text-blue-400" : "text-blue-700"
                        }`}
                    >
                        Your AI-Powered Trading Companion
                    </motion.h2>

                    {/* Tagline - Responsive */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className={`text-base sm:text-lg md:text-xl lg:text-2xl italic transition-colors ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                    >
                        Next stop — the moon!
                    </motion.p>

                    {/* Buttons - Responsive with touch targets */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4"
                    >
                        <Link
                            href="/login"
                            className={`px-6 sm:px-8 py-3 sm:py-3.5 text-base sm:text-lg font-medium text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation min-h-[44px] flex items-center justify-center ${
                                theme === "dark"
                                    ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30"
                                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/40"
                            }`}
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className={`px-6 sm:px-8 py-3 sm:py-3.5 text-base sm:text-lg font-medium text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation min-h-[44px] flex items-center justify-center ${
                                theme === "dark"
                                    ? "bg-green-600 hover:bg-green-700 hover:shadow-green-500/30"
                                    : "bg-green-600 hover:bg-green-700 hover:shadow-green-500/40"
                            }`}
                        >
                            Register
                        </Link>
                    </motion.div>
                </div>

                {/* RIGHT COLUMN: Animations - Responsive */}
                <div className="pointer-events-none absolute md:relative inset-0 md:inset-auto z-0 order-1 md:order-2 h-[300px] sm:h-[400px] md:h-auto">
                    {/* 🌙 Moon — Responsive sizing */}
                    <motion.div
                        className="absolute top-0 right-4 sm:right-8 md:right-0"
                    >
                        <div className={`absolute inset-0 blur-2xl rounded-full scale-110 transition-colors ${
                            theme === "dark"
                                ? "bg-gradient-to-b from-white/10 to-transparent"
                                : "bg-gradient-to-b from-black/25 to-transparent"
                        }`} />
                        <div className="scale-[0.67] sm:scale-[0.83] md:scale-100 origin-top-right">
                            <LottiePlayer
                                src="https://lottie.host/7186611e-aa0b-427c-b627-e61080a0425a/JsEPffT1cf.lottie"
                                width={300}
                                height={300}
                            />
                        </div>
                    </motion.div>

                    {/* 🚀 Rocket — Responsive positioning and sizing */}
                    <div className="absolute inset-0 md:relative flex items-center justify-center">
                        <motion.div
                            initial={{ x: "-60vw", y: "55vh", opacity: 0 }}
                            animate={{ x: 0, y: 0, opacity: 1 }}
                            transition={{ duration: 2.8, ease: "easeInOut" }}
                            className="relative"
                        >
                            {/* Soft glow behind astronaut */}
                            <div 
                                className={`absolute inset-0 -z-10 blur-3xl rounded-full transition-opacity duration-500 ${
                                    theme === "dark"
                                        ? "bg-blue-500/20"
                                        : "bg-blue-400/15"
                                }`}
                                style={{
                                    width: "120%",
                                    height: "120%",
                                    top: "-10%",
                                    left: "-10%"
                                }}
                            />
                            <div className="scale-[0.6] sm:scale-[0.8] md:scale-90 lg:scale-100 origin-center">
                                <LottiePlayer
                                    src="https://lottie.host/c79af507-3068-41d2-979f-47d4a65ff23b/yYb9eiJGgF.lottie"
                                    width={500}
                                    height={500}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Disclaimer - Responsive */}
            <footer className={`absolute bottom-0 left-0 right-0 z-10 px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-5 md:py-6 ${
                theme === "dark"
                    ? "bg-black/40 backdrop-blur-sm border-t border-white/5"
                    : "bg-white/40 backdrop-blur-sm border-t border-gray-200/50"
            }`}>
                <div className="max-w-7xl mx-auto">
                    <p className={`text-[10px] xs:text-xs sm:text-sm leading-relaxed text-center ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                        Profit Path provides market insights, trading signals, and AI-generated suggestions for informational and educational purposes only. We do not offer financial, investment, or trading advice, and we are not registered financial advisors or brokers. All trading decisions you make are solely your responsibility. Any actions you take based on our platform's recommendations, analysis, or content are done entirely at your own risk. Profit Path and its creators are not liable for any losses, damages, or outcomes resulting from trades or investment decisions made by users.
                    </p>
                </div>
            </footer>
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
