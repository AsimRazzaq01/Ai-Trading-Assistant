import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/app/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-8px)" },
                },
                rocket: {
                    "0%": { transform: "translateY(20px) rotate(-10deg)", opacity: "0" },
                    "50%": { transform: "translateY(-5px) rotate(5deg)", opacity: "1" },
                    "100%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
                },
                // ✨ NEW shimmer gradient animation for PROFIT PATH
                gradientMove: {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(-10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            animation: {
                "float-slow": "float 3s ease-in-out infinite",
                "rocket-takeoff": "rocket 1.5s ease-out",
                // ✨ Add the shimmer gradient motion
                "gradient-move": "gradientMove 6s ease-in-out infinite",
                fadeIn: "fadeIn 0.3s ease-out",
            },
        },
    },
    plugins: [],
};

export default config;



// import type { Config } from 'tailwindcss'
//
//
// export default {
//     content: [
//         "./src/app/**/*.{ts,tsx}",
//         "./src/components/**/*.{ts,tsx}",
//     ],
//     theme: { extend: {} },
//     plugins: [],
// } satisfies Config
