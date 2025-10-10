import { useState } from "react";
import { db, storage } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "./ui/button";
import { getAuth } from "firebase/auth";

interface ListingFormProps {
  onSuccess?: () => void;
}

export default function ListingForm({ onSuccess }: ListingFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("sell");
  const [brand, setBrand] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentUser) {
    alert("You must be logged in to create a listing.");
    return;
  }
  setLoading(true);

  try {
    let imageUrls: string[] = [];
    if (images && images.length > 0) {
      const uploadPromises = Array.from(images).map(async (image) => {
        const storageRef = ref(storage, `listings/${currentUser.uid}/${Date.now()}-${image.name}`);
        await uploadBytes(storageRef, image);
        return await getDownloadURL(storageRef);
      });
      imageUrls = await Promise.all(uploadPromises);
    }

    await addDoc(collection(db, "listings"), {
      title,
      description,
      price: parseFloat(price),
      type,
      brand,
      images: imageUrls,
      createdAt: serverTimestamp(),
      ownerId: currentUser.uid,
      ownerEmail: currentUser.email,
      ownerName: currentUser.displayName || "Unknown User",
    });

    alert("✅ Listing created successfully!");
    setTitle("");
    setDescription("");
    setPrice("");
    setType("sell");
    setBrand("");
    setImages(null);

    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput) fileInput.value = "";
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error adding listing:", error);
    alert("❌ Failed to create listing. Check console for details.");
  } finally {
    setLoading(false);
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-2xl p-6 space-y-4 max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4">Create a Listing</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 rounded"
        rows={3}
        required
      />

      <input
        type="text"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="sell">Sell</option>
        <option value="trade">Trade</option>
      </select>

      <input
        type="text"
        placeholder="Brand"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <input
        type="file"
        multiple
        onChange={(e) => setImages(e.target.files)}
        className="w-full border p-2 rounded"
        accept="image/*"
      />

      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Create Listing"}
      </Button>
    </form>
  );
}
