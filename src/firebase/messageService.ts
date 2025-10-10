import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";

// Helper to generate a unique chat ID for two users
export const getChatId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join("_");
};

// Send a message
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  text: string
) => {
  const chatId = getChatId(senderId, receiverId);
  const chatRef = doc(db, "chats", chatId);

  // Ensure chat doc exists
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [senderId, receiverId],
      createdAt: serverTimestamp(),
    });
  }

  // Add message to messages subcollection
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId,
    receiverId,
    text,
    timestamp: serverTimestamp(),
  });
};

// Listen for messages in real-time
export const listenForMessages = (
  chatId: string,
  callback: (messages: any[]) => void
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(msgs);
  });
};
