"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function MarketChatPage() {
  const { theme } = useTheme();
  
  // Load saved messages from localStorage
  const loadSavedMessages = (): Array<{ role: string; content: string; timestamp: Date }> => {
    try {
      const saved = localStorage.getItem("marketChatMessages");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (e) {
      console.error("Error loading saved messages:", e);
    }
    return [{
      role: "assistant",
      content: "Welcome to Market Chat! I'm your AI trading assistant. Ask me anything about the markets, trading strategies, or get real-time insights.",
      timestamp: new Date(),
    }];
  };

  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp: Date }>>(loadSavedMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 1) { // Only save if there are actual messages (more than just welcome)
      localStorage.setItem("marketChatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // ✅ Use API proxy route for chat
      const res = await fetch("/api/market-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      const assistantMessage = {
        role: "assistant",
        content: data.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("❌ Chat error:", err);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-black via-gray-950 to-black text-white'
          : 'bg-gradient-to-b from-[#f5f7fa] via-[#c3e0dc] to-[#9ad0c2] text-gray-900'
      }`}
    >
      <div className="max-w-4xl mx-auto p-6 pt-24 h-full flex flex-col">
        <h1
          className={`text-3xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-blue-600'
          }`}
        >
          Market Chat 💬
        </h1>

        <div
          className={`flex-1 rounded-lg shadow-md p-4 mb-4 overflow-y-auto border transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? theme === 'dark'
                        ? "bg-blue-600 text-white"
                        : "bg-blue-600 text-white"
                      : theme === 'dark'
                      ? "bg-gray-800 text-gray-200"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === "user"
                        ? "opacity-80"
                        : theme === 'dark'
                        ? "opacity-70 text-gray-400"
                        : "opacity-70"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className={`rounded-lg p-3 ${
                    theme === 'dark'
                      ? 'bg-gray-800'
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="flex space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${
                        theme === 'dark' ? 'bg-gray-400' : 'bg-gray-400'
                      }`}
                    ></div>
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${
                        theme === 'dark' ? 'bg-gray-400' : 'bg-gray-400'
                      }`}
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className={`w-2 h-2 rounded-full animate-bounce ${
                        theme === 'dark' ? 'bg-gray-400' : 'bg-gray-400'
                      }`}
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about markets, trading strategies, or get insights..."
            className={`flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500 placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 placeholder-gray-400'
            }`}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Send
          </button>
        </form>

        <div
          className={`mt-4 text-sm text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          <p>💡 Ask me about market trends, stock analysis, trading strategies, or get real-time insights!</p>
        </div>
      </div>
    </main>
  );
}
