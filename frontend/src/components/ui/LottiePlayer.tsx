"use client";

import { useEffect, useRef } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

interface LottiePlayerProps {
    src: string; // URL to .lottie or .json file
    width?: number;
    height?: number;
}

export default function LottiePlayer({ src, width = 300, height = 300 }: LottiePlayerProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            new DotLottie({
                autoplay: true,
                loop: true,
                canvas: canvasRef.current,
                src, // animation URL
            });
        }
    }, [src]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: `${width}px`, height: `${height}px` }}
        />
    );
}
