import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function MessagePage() {
  const { receiverId } = useParams<{ receiverId: string }>();
  const [receiverName, setReceiverName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchReceiverName = async () => {
      if (!receiverId) return;
      try {
        const userRef = doc(db, "users", receiverId);
        const userSnap = await getDoc(userRef);
        setReceiverName(userSnap.exists() ? userSnap.data().username || "Unknown User" : "User not found");
      } catch {
        setReceiverName("Error loading user");
      } finally {
        setLoading(false);
      }
    };
    fetchReceiverName();
  }, [receiverId]);

  useEffect(() => {
    if (!currentUser || !receiverId) return;

    const chatId = currentUser.uid < receiverId
      ? `${currentUser.uid}_${receiverId}`
      : `${receiverId}_${currentUser.uid}`;

    const messagesRef = collection(db, "messages", chatId, "chats");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [currentUser, receiverId]);

  const handleSend = async () => {
    if (!message.trim() || !currentUser || !receiverId) return;

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
    }
  };

  if (loading) return <div className="p-8 text-center text-[#FF7900]">Loading chat...</div>;

  return (
    <div className="min-h-screen bg-[#00244E] text-[#FF7900] px-6 py-8 flex flex-col items-center">
      <button
        onClick={() => navigate("/inbox")}
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
      >
        ← Back to Inbox
      </button>

      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">{receiverName}</h1>

      <div className="w-full max-w-md flex flex-col bg-[#0F3F8C] rounded-2xl shadow-md p-4 h-96 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-300 text-center mt-40">No messages yet...</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 flex ${msg.senderId === currentUser?.uid ? "justify-end" : "justify-start"}`}
            >
              <div className={`px-3 py-2 rounded-xl ${msg.senderId === currentUser?.uid ? "bg-[#FF7900] text-white" : "bg-gray-300 text-gray-800"}`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-full max-w-md gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-[#FF7900] text-white rounded-xl hover:bg-yellow-400 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
