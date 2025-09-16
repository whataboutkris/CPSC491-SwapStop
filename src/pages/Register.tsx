import { useState } from "react";
import NavBar from "../components/NavBar";

// Firebase Components 
import { registerUser } from "../firebase/auth";
import { db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // 1️⃣ Register user in Firebase Auth
      const user = await registerUser(email, password);

      // 2️⃣ Add user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username,
        email: user.email,
        profilePicUrl: "",
        rating: 0,
      });

      alert(`Account created for ${username}!`);
      // Optional: redirect to login or homepage
      // navigate("/login"); // if using react-router
    } catch (error) {
      // Handle unknown error type
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(errorMessage);
      alert("Error creating account: " + errorMessage);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1A2A47] text-[#F0F0F0]">
      <NavBar />

      <section className="flex flex-col items-center justify-center flex-1 px-6 py-32">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">
          Create a SwapStop Account
        </h1>
        <p className="text-lg md:text-xl mb-12 max-w-xl text-center text-gray-300">
          Join SwapStop and start bartering, buying, and selling sustainably with our community.
        </p>

        <form
          onSubmit={handleRegister}
          className="w-full max-w-md bg-[#2C3E70] p-8 rounded-xl shadow-lg space-y-6"
        >
          <div>
            <label className="block text-lg mb-2 text-gray-200">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full p-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#3D5CAA] bg-[#3C4F78] text-white"
              required
            />
          </div>

          <div>
            <label className="block text-lg mb-2 text-gray-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#3D5CAA] bg-[#3C4F78] text-white"
              required
            />
          </div>

          <div>
            <label className="block text-lg mb-2 text-gray-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#3D5CAA] bg-[#3C4F78] text-white"
              required
            />
          </div>

          <div>
            <label className="block text-lg mb-2 text-gray-200">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full p-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#3D5CAA] bg-[#3C4F78] text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#3D5CAA] hover:bg-[#526FBA] text-white font-bold py-3 rounded-lg transition-colors duration-300"
          >
            Register
          </button>

          <p className="text-center text-gray-300">
            Already have an account?{" "}
            <a href="/login" className="underline hover:text-[#526FBA]">
              Login
            </a>
          </p>
        </form>
      </section>
    </div>
  );
}
