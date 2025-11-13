import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";

export default function MessagePage() {
  const { receiverId } = useParams<{ receiverId: string }>();
  const [receiverName, setReceiverName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  // Scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch receiver name
  useEffect(() => {
    if (!receiverId) return;
    const fetchReceiver = async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", receiverId));
        setReceiverName(userSnap.exists() ? userSnap.data().username || "Unknown User" : "User not found");
      } catch {
        setReceiverName("Error loading user");
      } finally {
        setLoading(false);
      }
    };
    fetchReceiver();
  }, [receiverId]);

  // Listen to messages
  useEffect(() => {
    if (!currentUser || !receiverId) return;

    const chatId = currentUser.uid < receiverId
      ? `${currentUser.uid}_${receiverId}`
      : `${receiverId}_${currentUser.uid}`;

    const messagesRef = collection(db, "messages", chatId, "chats");
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [currentUser, receiverId]);

  // Send message
  const handleSend = async () => {
    if (!message.trim() || !currentUser || !receiverId) return;
    setSending(true);

    const chatId = currentUser.uid < receiverId
      ? `${currentUser.uid}_${receiverId}`
      : `${receiverId}_${currentUser.uid}`;

    try {
      const messagesRef = collection(db, "messages", chatId, "chats");
      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        receiverId,
        text: message.trim(),
        timestamp: serverTimestamp(),
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#FF7900]">Loading chat...</div>;

  return (
    <div className="min-h-screen bg-[#00244E] text-[#FF7900] px-4 py-6 flex flex-col items-center">
      <button
        onClick={() => navigate("/inbox")}
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
      >
        ← Back to Inbox
      </button>

      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">{receiverName}</h1>

      <div className="w-full max-w-md flex flex-col bg-[#0F3F8C] rounded-2xl shadow-md p-4 flex-1 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-300 text-center mt-40">No messages yet...</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 flex ${msg.senderId === currentUser?.uid ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-2xl max-w-[80%] break-words ${
                  msg.senderId === currentUser?.uid ? "bg-[#FF7900] text-white rounded-br-none" : "bg-gray-300 text-gray-800 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-xs text-gray-600 ml-1">{msg.timestamp?.toDate?.()?.toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-full max-w-md gap-2">
        <textarea
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
          className="flex-1 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7900] resize-none"
          rows={2}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-[#FF7900] text-white rounded-xl hover:bg-yellow-400 transition disabled:opacity-50"
          disabled={!message.trim() || sending}
        >
          Send
        </button>
      </div>
    </div>
  );
}
