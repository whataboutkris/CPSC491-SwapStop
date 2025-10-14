import { db } from "../firebase/firebase";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

export const listenToListings = (callback: (docs: any[]) => void) => {
  return onSnapshot(collection(db, "listings"), (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  });
};

export const deleteListing = async (id: string) => {
  await deleteDoc(doc(db, "listings", id));
};

export const updateListing = async (id: string, data: any) => {
  await updateDoc(doc(db, "listings", id), data);
};