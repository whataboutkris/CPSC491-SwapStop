import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

interface UserProfile {
  username: string;
  profilePicUrl: string;
  description?: string;
  email?: string;
  rating?: number;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfile({
          username: data.username || "Unnamed",
          profilePicUrl: data.profilePicUrl || "",
          description: data.description || "",
          email: data.email,
          rating: data.rating
        });
      }

      const listingsQuery = query(
        collection(db, "listings"),
        where("ownerId", "==", userId)
      );
      const listingsSnap = await getDocs(listingsQuery);
      setListings(listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Listing[]);
    };

    fetchUser();
  }, [userId]);

  if (!profile) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Profile Section */}
      <div className="flex items-center space-x-4">
        <img
          src={
            profile.profilePicUrl ||
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
          }
          alt={profile.username}
          className="w-24 h-24 rounded-full border shadow"
        />
        <div>
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          {profile.description && <p className="text-gray-600">{profile.description}</p>}
          {profile.email && <p className="text-sm text-gray-500">📧 {profile.email}</p>}
          {typeof profile.rating === "number" && (
            <p className="text-sm text-yellow-500">⭐ {profile.rating.toFixed(1)} rating</p>
          )}
        </div>
      </div>

      {/* Listings Section */}
      <h2 className="mt-8 mb-4 text-xl font-semibold">Listings</h2>
      {listings.length === 0 ? (
        <p className="text-gray-500">No listings found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {listings.map(listing => (
            <div key={listing.id} className="border rounded-lg p-4 shadow-sm">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-40 object-cover rounded-md"
              />
              <h3 className="mt-2 font-bold">{listing.title}</h3>
              <p className="text-gray-500">${listing.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
