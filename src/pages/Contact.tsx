import { useState } from "react";
import NavBar from "../components/NavBar";
import logo from "../assets/SwapStop-Logo-Transparent.png";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = "StopSwap@outlook.com";
    const subject = encodeURIComponent("Message from SwapStop Contact Form");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${emailInput}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#00244E] text-[#FF7900]">
      <NavBar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-1 px-6 py-20 md:py-32">
        <img
          src={logo}
          alt="SwapStop Logo"
          className="h-20 w-auto mb-6 transition-transform duration-300 hover:scale-105 hover:opacity-90"
        />
        <h1 className="mt-10 text-4xl md:text-6xl font-extrabold mb-6">
          Contact Us
        </h1>
        <p className="text-lg md:text-2xl mb-8 max-w-2xl">
          Have questions, feedback, or need support?  
          We’d love to hear from you!
        </p>
      </section>

      {/* Contact Info Section */}
      <section className="bg-[#f3cd47] text-[#00244E] py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <a
            href="mailto:StopSwap@outlook.com"
            className="flex flex-col items-center p-6 rounded-lg shadow-lg bg-white transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <Mail className="h-10 w-10 mb-3 text-[#FF7900]" />
            <h2 className="text-2xl font-bold mb-2">Email</h2>
            <p className="text-lg">StopSwap@outlook.com</p>
          </a>

          <a
            href="tel:+18005551234"
            className="flex flex-col items-center p-6 rounded-lg shadow-lg bg-white transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <Phone className="h-10 w-10 mb-3 text-[#FF7900]" />
            <h2 className="text-2xl font-bold mb-2">Phone</h2>
            <p className="text-lg">+1 (800) 555-1234</p>
          </a>

          <a
            href="https://www.google.com/maps/search/?api=1&query=800+N+State+College+Blvd,+Fullerton,+CA+92831"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 rounded-lg shadow-lg bg-white transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <MapPin className="h-10 w-10 mb-3 text-[#FF7900]" />
            <h2 className="text-2xl font-bold mb-2">Address</h2>
            <p className="text-lg">
              800 N State College Blvd<br />
              Fullerton, CA 92831
            </p>
          </a>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-[#00244E] text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-[#FF7900]">
            Send Us a Message
          </h2>
          <form onSubmit={handleSendMessage} className="space-y-6">
            <div>
              <label className="block text-lg mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-white text-[#00244E] focus:outline-none focus:ring-4 focus:ring-yellow-400"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-lg mb-2">Email</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full p-3 rounded-lg bg-white text-[#00244E] focus:outline-none focus:ring-4 focus:ring-yellow-400"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-lg mb-2">Message</label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 rounded-lg bg-white text-[#00244E] focus:outline-none focus:ring-4 focus:ring-yellow-400"
                placeholder="Write your message..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#FF7900] text-white font-bold py-3 rounded-lg hover:bg-[#ff9a33] transition-colors duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F3F8C] text-green-200 py-3 text-center">
        &copy; {new Date().getFullYear()} SwapStop. All rights reserved.
      </footer>
    </div>
  );
}
