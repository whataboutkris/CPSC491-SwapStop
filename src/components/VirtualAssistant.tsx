import { useEffect, useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageCircle, X, Minus, Send } from "lucide-react";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// This is literally what we give gemini to make the responses, super neat.
const SYSTEM_CONTEXT = `You are a helpful assistant for a trading platform where users can buy, sell, and trade items. 

Key features of the platform:
- Users can create listings for items they want to trade/sell
- Users can browse items and make offers
- Safe trading practices are encouraged
- Users have profiles with ratings and transaction history
- Website name is SwapStop

Common user questions:
- How to create a listing
- What items are allowed to be traded
- Safety tips for trading
- How the rating system works
- How to contact other users
- Platform rules and guidelines

Please provide helpful, concise yet short answers. Be friendly and guide users to the appropriate sections of the platform when needed.`;

interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  timestamp: number;
}

export default function VirtualAssistant() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.username) setUsername(data.username);
        if (data.assistantChat) setMessages(data.assistantChat);
      } else {
        await setDoc(userRef, { assistantChat: [] }, { merge: true });
      }
    };
    loadData();
  }, [user]);

  const saveMessages = async (updatedMessages: ChatMessage[]) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { assistantChat: updatedMessages }, { merge: true });
  };

  const handlePrompt = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setInput("");

    const userMessage: ChatMessage = {
      sender: "user",
      text: prompt,
      timestamp: Date.now(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash"
      });
      
      const conversationHistory = updatedMessages
        .slice(-6)
        .map(msg => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
        .join("\n");
      const fullPrompt = `${SYSTEM_CONTEXT}

Previous conversation:
${conversationHistory}

Please respond to the user's latest message.`;

      const result = await model.generateContent(fullPrompt);
      const reply = result.response.text();

      const assistantMessage: ChatMessage = {
        sender: "assistant",
        text: reply,
        timestamp: Date.now(),
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      await saveMessages(finalMessages);
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage: ChatMessage = {
        sender: "assistant",
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      await saveMessages(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePrompt(input);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#FF7900] p-4 rounded-full shadow-lg hover:scale-105 transition-transform text-white"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-[32rem] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center bg-[#00244E] text-white px-4 py-3 rounded-t-2xl">
            <span className="font-semibold">
              Hi {username || "there"} 👋
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80 transition"
                aria-label="Minimize chat"
              >
                <Minus size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:opacity-80 transition"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-4">
                👋 Welcome! Ask me anything about using the platform.
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[85%] ${
                    msg.sender === "user"
                      ? "bg-[#FF7900] text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 p-3 rounded-lg rounded-bl-none text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 0 && (
            <div className="px-3 py-2 border-t border-gray-200 bg-white">
              <div className="text-xs text-gray-500 mb-2">Quick questions:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "What can I trade?",
                  "How do I make a listing?",
                  "Safety tips",
                  "How does rating work?"
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handlePrompt(q)}
                    disabled={loading}
                    className="bg-[#00244E] text-white text-xs px-3 py-1.5 rounded-full hover:bg-[#003F8C] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Field */}
          <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7900] focus:border-transparent disabled:bg-gray-100 text-sm"
              />
              <button
                onClick={() => handlePrompt(input)}
                disabled={loading || !input.trim()}
                className="bg-[#FF7900] text-white p-2 rounded-lg hover:bg-[#E86D00] transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}