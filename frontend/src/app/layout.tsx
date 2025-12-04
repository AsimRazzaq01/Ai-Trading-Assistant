import "../globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
    title: "AI Trading Assistant",
    description: "AI-powered trading app",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="relative min-h-screen">
            <ThemeProvider>
                {/* Global Animated Background */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="background-dark dark:block hidden"></div>
                    <div className="background-light dark:hidden block"></div>
                </div>
                {children}
            </ThemeProvider>
        </body>
        </html>
    );
}
