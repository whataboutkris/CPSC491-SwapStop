import { useState } from "react";
import { uploadImage } from "../firebase/storage";
import { addItem } from "../firebase/items"; // your Firestore item CRUD

export default function CreateListing() {
  const [file, setFile] = useState(null);
  const [itemName, setItemName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      // Upload image to Firebase Storage
      const imageUrl = await uploadImage(file, `items/${itemName}/${file.name}`);

      // Add item to Firestore
      await addItem({
        name: itemName,
        images: [imageUrl],
        ownerId: "USER_UID_HERE", // replace with logged-in user UID
      });

      console.log("Item created!");
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-20">
      <input
        type="text"
        placeholder="Item Name"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        required
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept="image/*"
        required
      />
      <button type="submit" className="bg-indigo-700 text-white p-2 rounded">
        Create Listing
      </button>
    </form>
  );
}
