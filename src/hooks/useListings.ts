import { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  type: string;
  trade?: boolean;
  brand: string;
  ownerId: string;
}

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [ownerMap, setOwnerMap] = useState<Record<string, { username: string; profilePicUrl: string }>>({});

  // Listen for listings
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "listings"), (snapshot) => {
      setListings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Listing[]);
    });
    return () => unsubscribe();
  }, []);

  // Fetch owner info
  useEffect(() => {
    listings.forEach(async (listing) => {
      if (listing.ownerId && !ownerMap[listing.ownerId]) {
        const userSnap = await getDoc(doc(db, "users", listing.ownerId));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setOwnerMap((prev) => ({
            ...prev,
            [listing.ownerId]: {
              username: data.username || "Unknown User",
              profilePicUrl:
                data.profilePicUrl ||
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
            },
          }));
        }
      }
    });
  }, [listings]);

  // CRUD functions
  const deleteListing = async (id: string) => {
    await deleteDoc(doc(db, "listings", id));
  };

  const updateListing = async (id: string, updatedFields: Partial<Listing>) => {
    await updateDoc(doc(db, "listings", id), updatedFields);
  };

  return { listings, ownerMap, deleteListing, updateListing };
}