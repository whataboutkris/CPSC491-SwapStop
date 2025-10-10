import { useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export default function AddListing() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return alert("Please log in.");

    if (!image) return alert("Please select an image.");

    const storage = getStorage();
    const imageRef = ref(storage, `listing_images/${Date.now()}-${image.name}`);
    await uploadBytes(imageRef, image);
    const imageUrl = await getDownloadURL(imageRef);

    await addDoc(collection(db, "listings"), {
      title,
      price,
      imageUrl,
      ownerId: currentUser.uid,
      createdAt: Timestamp.now()
    });

    navigate(`/user/${currentUser.uid}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Listing
        </button>
      </form>
    </div>
  );
}
