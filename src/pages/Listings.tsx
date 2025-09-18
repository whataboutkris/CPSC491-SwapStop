import NavBar from "../components/NavBar";
import { Button } from "../components/ui/button";

const dummyListings = [
  {

    /*Listings (Dummy for now) */

    id: 1,
    title: "Wireless Headphones",
    description: "Noise-cancelling over-ear headphones with 30hr battery life.",
    price: "$120",
    image:
      "https://m.media-amazon.com/images/I/71+Gc-VhOkL.jpg_BO30,255,255,255_UF900,850_SR1910,1000,0,C_QL100_.jpg",
  },
  {
    id: 2,
    title: "Vintage Gaming Laptop",
    description: "High performance laptop with RTX 4060 and 16GB RAM.",
    price: "$1,299",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIUyyfu1tQZomR0Wn8IwCNBt3TUZ_Wjg4xXg&s",
  },
  {
    id: 3,
    title: "Vintage Camera",
    description: "Classic film camera in great condition with leather case.",
    price: "$300",
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    title: "Mountain Bike",
    description: "Lightly-used aluminum frame, perfect for commuters.",
    price: "$800",
    image:
      "https://images.fineartamerica.com/images/artworkimages/mediumlarge/1/broken-bicycle-carl-purcell.jpg",
  },
];

export default function Listings() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <NavBar />

      <main className="flex-1 px-6 py-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800">
          Browse Listings
        </h1>

        {/* Grid of Items */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {dummyListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-48 w-full object-cover"
              />

              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold mb-1 line-clamp-1">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-600">
                    {item.price}
                  </span>
                  <Button
                    onClick={() => alert(`Viewing ${item.title} (PLACEHOLDER)`)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
