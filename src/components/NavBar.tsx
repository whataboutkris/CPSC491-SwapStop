import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "../assets/SwapStop-Logo-Transparent.png";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null); // clear local state
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
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white uppercase">
              {user.displayName
                ? user.displayName.charAt(0)
                : user.email?.charAt(0) || "U"}
            </div>
            <span>{user.displayName || user.email}</span>
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
