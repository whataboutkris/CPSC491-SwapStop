import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const addItem = async (itemData) => {
  try {
    const docRef = await addDoc(collection(db, "items"), {
      ...itemData,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};
