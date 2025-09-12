import { Button } from "./ui/button";

export default function NavBar() {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-[#00244E] text-white shadow-md">
      {/* Logo */}
      <h1 className="text-2xl font-bold">SwapStop</h1>

      {/* Navigation Links */}
      <nav className="hidden md:flex gap-6 text-lg font-medium">
        <a href="#features" className="hover:text-indigo-300 transition-colors">Features</a>
        <a href="#about" className="hover:text-indigo-300 transition-colors">About</a>
        <a href="#contact" className="hover:text-indigo-300 transition-colors">Contact</a>
      </nav>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="bg-white text-indigo-800 hover:bg-gray-100">Sign Up</Button>
        <Button className="bg-transparent border border-white hover:bg-white hover:text-indigo-800">Login</Button>
      </div>
    </header>
  );
}