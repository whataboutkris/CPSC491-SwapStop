import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: any;
}

export default function MessagePage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { listing } = location.state || {};

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserId, setOtherUserId] = useState<string>("");
  const [otherUsername, setOtherUsername] = useState<string>("");

  useEffect(() => {
    if (!chatId || !currentUser) return;
    
    const fetchOtherUserInfo = async () => {
      const userIds = chatId.split("_");
      const otherId = userIds.find(id => id !== currentUser.uid);
      if (otherId) {
        setOtherUserId(otherId);
        
        try {
          const userSnap = await getDoc(doc(db, "users", otherId, "public", "info"));
          if (userSnap.exists()) {
            setOtherUsername(userSnap.data().username || otherId);
          } else {
            setOtherUsername(otherId);
          }
        } catch (err) {
          console.error("Error fetching username:", err);
          setOtherUsername(otherId);
        }
      }
    };
    
    fetchOtherUserInfo();
  }, [chatId, currentUser]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(collection(db, "messages", chatId, "chats"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        senderId: doc.data().senderId,
        receiverId: doc.data().receiverId,
        text: doc.data().text,
        timestamp: doc.data().timestamp,
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !chatId || !otherUserId) {
      console.log("Missing required data:", {
        message: !!newMessage.trim(),
        currentUser: !!currentUser,
        chatId,
        otherUserId
      });
      return;
    }

    const messageData = {
      senderId: currentUser.uid,
      receiverId: otherUserId,
      text: newMessage.trim(),
      timestamp: serverTimestamp(),
    };

    try {
      console.log("Sending message to chatId:", chatId);
      console.log("From:", currentUser.uid, "To:", otherUserId);
      
      await addDoc(collection(db, "messages", chatId, "chats"), messageData);
      console.log("✅ Message added to chat");

      await setDoc(doc(db, "users", currentUser.uid, "chats", chatId), {
        otherUserId: otherUserId,
        lastMessage: newMessage.trim(),
        lastUpdated: serverTimestamp(),
      });
      console.log("✅ Current user chat index updated");

      await setDoc(doc(db, "users", otherUserId, "chats", chatId), {
        otherUserId: currentUser.uid,
        lastMessage: newMessage.trim(),
        lastUpdated: serverTimestamp(),
      });
      console.log("✅ Other user chat index updated");

      setNewMessage("");
      console.log("✅ Message sent successfully!");
    } catch (error) {
      console.error("❌ Error sending message:", error);
      alert("Failed to send message. Check console for details.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back button and username */}
      <div className="p-4 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/inbox")}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg font-semibold"
          >
            ← Back to Inbox
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {otherUsername || "Loading..."}
          </h2>
        </div>
        <button
          onClick={() => navigate("/listings")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold"
        >
          View Listings
        </button>
      </div>

      {/* Listing preview - only show if listing data exists */}
      {listing && (
        <div className="bg-white shadow-md rounded-xl p-4 mx-4 mt-4 mb-4 flex items-center gap-4">
          {listing.images && listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
          <div>
            <h2 className="font-bold text-lg">{listing.title}</h2>
            <p className="text-gray-600 line-clamp-2">{listing.description}</p>
            <p className="text-indigo-600 font-semibold mt-1">${listing.price}</p>
            {listing.type === "trade" && (
              <span className="text-green-600 text-sm font-medium">Available for Trade</span>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex flex-col p-4 gap-2 max-h-[60vh] overflow-y-auto mx-4 mb-4 bg-white rounded-xl shadow-md">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-xl max-w-[75%] ${
                msg.senderId === currentUser?.uid
                  ? "bg-indigo-600 text-white self-end"
                  : "bg-gray-200 text-gray-800 self-start"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <div className="flex gap-2 p-4 bg-white shadow-inner mx-4 rounded-xl">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}