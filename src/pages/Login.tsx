import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

// Firebase Auth
import { loginUser } from "../firebase/auth.ts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Login user with Firebase Auth
      const user = await loginUser(email, password);
      alert(`Welcome back, ${user.email}!`);

      // Redirect to homepage after login
      navigate("/home");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(errorMessage);
      alert("Login failed: " + errorMessage);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1A2A47] text-[#F0F0F0]">
      <NavBar />

      <section className="flex flex-col items-center justify-center flex-1 px-6 py-32">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">
          Login to SwapStop
        </h1>
        <p className="text-lg md:text-xl mb-12 max-w-xl text-center text-gray-300">
          Welcome back! Please login to access your account and start bartering, buying, and selling.
        </p>

        <form
        data-testid="login-form"
          onSubmit={handleLogin}
          className="w-full max-w-md bg-[#2C3E70] p-8 rounded-xl shadow-lg space-y-6"
        >
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

          <button
            type="submit"
            className="w-full bg-[#3D5CAA] hover:bg-[#526FBA] text-white font-bold py-3 rounded-lg transition-colors duration-300"
          >
            Login
          </button>

          <p className="text-center text-gray-300">
            Don't have an account?{" "}
            <a href="/register" className="underline hover:text-[#526FBA]">
              Register
            </a>
          </p>
        </form>
      </section>
    </div>
  );
}
