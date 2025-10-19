import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";

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
  images: string[];
  ownerId: string;
  ownerUsername?: string;
  ownerProfilePicUrl?: string;
}

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!userId) return;

    const fetchUserAndListings = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile({
            username: data.username || "Unnamed",
            profilePicUrl:
              data.profilePicUrl ||
              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
            description: data.description || "",
            email: data.email,
            rating: data.rating,
          });
        }

        // Fetch listings
        const listingsQuery = query(collection(db, "listings"), where("ownerId", "==", userId));
        const listingsSnap = await getDocs(listingsQuery);

        const listingsData: Listing[] = [];
        for (const docSnap of listingsSnap.docs) {
          const data = docSnap.data();
          const ownerId = data.ownerId;
          let ownerUsername = "Unknown";
          let ownerProfilePicUrl =
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

          // Fetch owner info dynamically (should be same as user page owner)
          const ownerSnap = await getDoc(doc(db, "users", ownerId));
          if (ownerSnap.exists()) {
            const ownerData = ownerSnap.data();
            ownerUsername = ownerData.username || ownerUsername;
            ownerProfilePicUrl = ownerData.profilePicUrl || ownerProfilePicUrl;
          }

          listingsData.push({
            id: docSnap.id,
            title: data.title,
            price: data.price,
            images: data.images || [],
            ownerId,
            ownerUsername,
            ownerProfilePicUrl,
          });
        }

        setListings(listingsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndListings();
  }, [userId]);

  if (loading) return <div className="p-8 text-center text-[#FF7900]">Loading...</div>;
  if (!profile) return <div className="p-8 text-center text-[#FF7900]">User not found.</div>;

  const isCurrentUser = currentUser?.uid === userId;

  return (
    <div className="min-h-screen bg-[#00244E] text-[#FF7900] px-6 py-8">
      <button
        onClick={() => navigate("/home")}
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
      >
        ← Back
      </button>

      {/* Profile Card */}
      <div className="flex flex-col md:flex-row items-center bg-[#0F3F8C] p-6 rounded-2xl shadow-lg mb-10">
        <img
          src={profile.profilePicUrl}
          alt={profile.username}
          className="w-28 h-28 rounded-full border-2 border-[#FF7900] shadow mb-4 md:mb-0 md:mr-6"
        />
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">{profile.username}</h1>
          {profile.description && <p className="text-gray-200 mt-1">{profile.description}</p>}
          {profile.email && <p className="text-sm text-gray-300 mt-1">📧 {profile.email}</p>}
          {typeof profile.rating === "number" && (
            <p className="text-sm text-yellow-400 mt-1">⭐ {profile.rating.toFixed(1)} rating</p>
          )}

          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
            {isCurrentUser ? (
              <Link
                to="/edit-profile"
                className="px-4 py-2 bg-[#FF7900] text-white rounded hover:bg-yellow-400 transition"
              >
                Edit Profile
              </Link>
            ) : (
              <Link
                to={`/messages/${userId}`}
                className="px-4 py-2 bg-[#3D5CAA] text-white rounded hover:bg-[#526FBA] transition"
              >
                Message User
              </Link>
            )}
            <Link
              to="/inbox"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Inbox
            </Link>
          </div>
        </div>
      </div>

      {/* Listings */}
      <h2 className="text-2xl font-bold mb-6">Listings</h2>
      {listings.length === 0 ? (
        <p className="text-gray-300">No listings found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-[#0F3F8C] rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition"
            >
              {listing.images[0] && (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 text-white">
                <h3 className="font-bold text-lg">{listing.title}</h3>
                <p className="mt-1">${listing.price}</p>
                {/* Owner info */}
                <div className="flex items-center mt-2">
                  <img
                    src={listing.ownerProfilePicUrl}
                    alt={listing.ownerUsername}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-gray-200 text-sm">{listing.ownerUsername}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

