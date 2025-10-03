import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "../assets/SwapStop-Logo-Transparent.png";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [profilePicUrl, setProfilePicUrl] = useState<string | undefined>(undefined);

  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUsername(data.username || undefined);
            setProfilePicUrl(
              data.profilePicUrl ||
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
            );
          }
        } catch (error) {
          console.error("Failed to fetch user data from Firestore:", error);
        }
      } else {
        setUsername(undefined);
        setProfilePicUrl(undefined);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null); // clear local state
      setUsername(undefined);
      setProfilePicUrl(undefined);
      navigate("/login"); // redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-[#0F3F8C] text-white shadow-md">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img
          src={logo}
          alt="SwapStop Logo"
          className="h-12 w-auto hover:opacity-90 transition-opacity"
        />
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex gap-6 text-lg font-medium items-center">
        <Link to="/home" className="hover:text-indigo-300 transition-colors">
          Home
        </Link>
        <Link to="/listings" className="hover:text-indigo-300 transition-colors">
          Listings
        </Link>
        <Link to="/users" className="hover:text-indigo-300 transition-colors">
          Users
        </Link>
        <Link to="/about" className="hover:text-indigo-300 transition-colors">
          About
        </Link>
        <Link to="/contact" className="hover:text-indigo-300 transition-colors">
          Contact
        </Link>
      </nav>

      {/* Action Buttons / User Profile */}
      <div className="flex gap-4 items-center">
        {!user ? (
          <>
            <Link to="/register">
              <Button className="bg-white text-indigo-800 hover:bg-gray-100">
                Sign Up
              </Button>
            </Link>

            <Link to="/login">
              <Button className="bg-transparent border border-white hover:bg-white hover:text-indigo-800">
                Login
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link
              to={`/user/${user.uid}`}
              className="flex items-center gap-2 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              <img
                src={profilePicUrl}
                alt={username ?? user.email ?? "User"}
                className="w-8 h-8 rounded-full object-cover border"
              />
              <span>{username ?? user.email ?? "User"}</span>
            </Link>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
