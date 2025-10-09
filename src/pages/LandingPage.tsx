import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import NavBar from "../components/NavBar";
import logo from "../assets/SwapStop-Logo-Transparent.png"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#00244E] text-[#FF7900]">
      {/* Navbar */}
      <NavBar />

      {/* Hero Section */}
<section className="flex flex-col items-center justify-center text-center flex-1 px-6 py-20 md:py-32">
  {/* Logo */}
  <img
  src={logo}
  alt="SwapStop Logo"
  className="h-15 w-auto scale-350 origin-center mb-6 hover:opacity-90 transition-transform"
/>

  {/* Heading */}
  <h1 className="mt-20 text-4xl md:text-6xl font-extrabold mb-6 text-[#FF7900]">
    Revolutionize Your Trading Experience
  </h1>

  <p className="text-lg md:text-2xl mb-8 max-w-2xl">
    Buy, sell, and trade items securely with AI-driven tools that make online commerce smarter and faster.
  </p>

  <div className="flex gap-4">
    <Link to="/register">
      <Button className="bg-yellow-300 text-green-800 font-bold hover:bg-yellow-400">
        Get Started
      </Button>
    </Link>
    <Link to="/About">
      <Button className="bg-transparent border border-yellow-300 hover:bg-yellow-300 hover:text-green-800 font-bold">
        Learn More
      </Button>
    </Link>
  </div>
</section>


      {/* Features Section */}
      <section className="bg-[#f3cd47] text-[#00244E] py-20 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Why Choose SwapStop?
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">AI-Powered Trading</h3>
            <p>
              Leverage AI to optimize your buying, selling, and trading experience, making smarter deals effortlessly.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
            <p>
              SwapStop ensures every trade and transaction is protected with state-of-the-art security protocols.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
            <p>
              Connect with a growing community of buyers, sellers, and traders to discover and exchange valuable items.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg[#EBFBFF]0 text-[#FF7900] py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to start swapping smarter?
        </h2>
        <p className="mb-8 max-w-2xl mx-auto">
          Join SwapStop today and experience a secure, AI-enhanced platform that makes trading easier than ever.
        </p>
        <Link to="/register">
          <Button className="bg-yellow-300 text-green-800 font-bold hover:bg-yellow-400">
            Sign Up Now
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F3F8C] text-green-200 py-3 text-center">
        &copy; {new Date().getFullYear()} SwapStop. All rights reserved.
      </footer>
    </div>
  );
}
