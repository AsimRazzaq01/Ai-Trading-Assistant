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
        <body className="bg-gray-50 text-gray-900">
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </body>
        </html>
    );
}
