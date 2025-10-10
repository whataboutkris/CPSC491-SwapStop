import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface ChatPreview {
  chatId: string;
  otherUserId: string;
  lastMessage: string;
  timestamp: any;
}

export default function InboxPage() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const messagesRef = collection(db, "messages");
    const unsubscribe = onSnapshot(messagesRef, async (snapshot) => {
      const chatPreviews: ChatPreview[] = [];

      for (const docSnap of snapshot.docs) {
        const chatId = docSnap.id;
        if (!chatId.includes(currentUser.uid)) continue;

        const subcol = collection(db, "messages", chatId, "chats");
        const q = query(subcol, orderBy("timestamp", "desc"), limit(1));
        onSnapshot(q, (subSnapshot) => {
          subSnapshot.forEach((msgDoc) => {
            const data = msgDoc.data();
            const otherUserId =
              currentUser.uid === data.senderId ? data.receiverId : data.senderId;

            if (!chatPreviews.find((c) => c.chatId === chatId)) {
              chatPreviews.push({
                chatId,
                otherUserId,
                lastMessage: data.text,
                timestamp: data.timestamp,
              });
            }
          });
          chatPreviews.sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
          setChats([...chatPreviews]);
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    return <p className="p-8 text-center text-red-600">You must be logged in to view your inbox.</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00244E] px-6 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#00244E]">Inbox</h1>

        {loading ? (
          <p className="text-gray-500 text-center">Loading chats...</p>
        ) : chats.length === 0 ? (
          <p className="text-gray-500 text-center">No chats yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {chats.map((chat) => (
              <button
                key={chat.chatId}
                onClick={() => navigate(`/messages/${chat.otherUserId}`)}
                className="flex justify-between items-center p-3 bg-[#0F3F8C] text-white rounded-lg shadow hover:shadow-xl transition"
              >
                <span className="font-medium">{chat.otherUserId}</span>
                <span className="text-gray-300 text-sm truncate max-w-xs">
                  {chat.lastMessage}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Back to Profile Button */}
        <button
          onClick={() => navigate(`/user/${currentUser.uid}`)}
          className="w-full mt-6 py-2 rounded text-white font-semibold bg-gray-600 hover:bg-gray-700"
        >
          ← Back to Profile
        </button>
      </div>
    </div>
  );
}
