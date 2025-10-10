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

// Might update later to not always create a UID for each msg as it might lag our system.
export const getChatId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join("_");
};

// Helps to send msg
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  text: string
) => {
  const chatId = getChatId(senderId, receiverId);
  const chatRef = doc(db, "chats", chatId);

 
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [senderId, receiverId],
      createdAt: serverTimestamp(),
    });
  }

  // Adds message to "Messages" and saves them under unique UID, might change it though
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId,
    receiverId,
    text,
    timestamp: serverTimestamp(),
  });
};

// Currently working to make this work in real time however need to create a token system or route in order for the msg to be pulled and possibly add a time stamp to create a realtime process. 
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
