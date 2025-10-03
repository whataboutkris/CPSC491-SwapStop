import { useEffect, useState } from "react";
import { useParams, Link, useNavigate} from "react-router-dom";
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
  imageUrl: string;
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

    const fetchUser = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile({
            username: data.username || "Unnamed",
            profilePicUrl:
              data.profilePicUrl ||
              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
            description: data.description || "",
            email: data.email,
            rating: data.rating,
          });
        }

        const listingsQuery = query(collection(db, "listings"), where("ownerId", "==", userId));
        const listingsSnap = await getDocs(listingsQuery);
        setListings(
          listingsSnap.docs.map((doc) => {
            const data = doc.data() as Omit<Listing, "id">; // ignore "id" from data
            return { id: doc.id, ...data };
          })
        );
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return <div className="p-8 text-center">User not found.</div>;

  const isCurrentUser = currentUser?.uid === userId;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate("/home")}
        className="mb-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Back to Home
      </button>
      {/* Profile Section */}
      <div className="flex items-center space-x-4">
        <img
          src={profile.profilePicUrl}
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

          {/* Show Edit Profile button if current user */}
          {isCurrentUser && (
            <Link
              to="/edit-profile"
              className="mt-3 inline-block px-4 py-2 bg-[#FF7900] text-white rounded hover:bg-yellow-500"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Listings Section */}
      <h2 className="mt-8 mb-4 text-xl font-semibold">Listings</h2>
      {listings.length === 0 ? (
        <p className="text-gray-500">No listings found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {listings.map((listing) => (
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
