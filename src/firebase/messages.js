import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

// Send a message
export const sendMessage = async (from, to, content) => {
  await addDoc(collection(db, "messages"), {
    from,
    to,
    content,
    timestamp: serverTimestamp(),
  });
};

// Get all messages between two users
export const getMessages = async (user1, user2) => {
  const q = query(collection(db, "messages"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};
