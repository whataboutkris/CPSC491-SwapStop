import NavBar from "../components/NavBar";
import founder1 from "../assets/img1.png";
import founder2 from "../assets/img1.png";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-[#00244E] text-[#FF7900]">
      <NavBar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-1 px-6 py-20 md:py-32">
        <h1 className="mt-10 text-4xl md:text-6xl font-extrabold mb-6">
          About SwapStop
        </h1>
        <p className="text-lg md:text-2xl mb-8 max-w-3xl">
          SwapStop is a unique e-commerce platform that gives items a second life.  
          Through innovative bartering, AI pricing tools, and a community-driven approach,  
          we reduce waste and foster sustainable trading.
        </p>
      </section>

      {/* Mission Section */}
      <section className="bg-[#f3cd47] text-[#00244E] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg md:text-xl">
            In a world where millions of functional items go to waste, SwapStop encourages a second life for products.  
            Our mission is to make trading smarter, easier, and more sustainable while building a community of like-minded users.
          </p>
        </div>
      </section>

      {/* How SwapStop Works */}
      <section className="py-20 px-6 text-[#FF7900]">
        <div className="max-w-6xl mx-auto space-y-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">How SwapStop Works</h2>

          <div className="space-y-6">
            <p>
              Users can barter items for other items, items plus cash, or sell items for cash.  
              Our AI pricing model estimates fair trade values to facilitate smooth transactions.
            </p>
            <p>
              The homepage is a dynamic hub where users explore listings, receive recommendations, and search products by category, condition, or price.  
              Messaging features and user profiles create seamless communication and long-term connections.
            </p>
            <p>
              Security and trust are central: users verify their emails and phone numbers, rate transactions, and negative reviews trigger review processes.  
              Premium accounts, advertisements, and transaction fees allow us to sustain and grow the platform.
            </p>
            <p>
              By combining e-commerce simplicity with sustainability and community interaction, SwapStop provides an innovative alternative to traditional marketplaces.
            </p>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="bg-[#f3cd47] text-[#00244E] py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Meet Our Founders</h2>
          <div className="grid md:grid-cols-3 gap-12 items-center">
            <div className="flex flex-col items-center">
              <img
                src={founder1}
                alt="Founder 1"
                className="w-48 h-48 rounded-full object-cover mb-4 border-4 border-[#FF7900]"
              />
              <h3 className="text-2xl font-semibold mb-1">Bryant Martinez</h3>
              <p className="text-lg">Co-Founder</p>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={founder2}
                alt="Founder 2"
                className="w-48 h-48 rounded-full object-cover mb-4 border-4 border-[#FF7900]"
              />
              <h3 className="text-2xl font-semibold mb-1">Kristian Losenara</h3>
              <p className="text-lg">Co-Founder</p>
            </div>
             <div className="flex flex-col items-center">
              <img
                src={founder2}
                alt="Founder 3"
                className="w-48 h-48 rounded-full object-cover mb-4 border-4 border-[#FF7900]"
              />
              <h3 className="text-2xl font-semibold mb-1">Juan Cisneros</h3>
              <p className="text-lg">Co-Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#00244E] text-[#FF7900] py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Join Our Community
        </h2>
        <p className="mb-8 max-w-2xl mx-auto">
          Experience SwapStop today and be part of a sustainable, community-driven marketplace.
        </p>
        <a
          href="/contact"
          className="inline-block bg-yellow-300 text-green-800 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors duration-300"
        >
          Contact Us
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F3F8C] text-green-200 py-3 text-center">
        &copy; {new Date().getFullYear()} SwapStop. All rights reserved.
      </footer>
    </div>
  );
}
