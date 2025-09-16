import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "../assets/SwapStop-Logo-Transparent.png"

export default function NavBar() {
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
        <Link to="/about" className="hover:text-indigo-300 transition-colors">
          About
        </Link>
        <Link to="/contact" className="hover:text-indigo-300 transition-colors">
          Contact
        </Link>
      </nav>

      {/* Action Buttons */}
      <div className="flex gap-4">
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
      </div>
    </header>
  );
}
