import { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import ListingForm from "../components/ListingForm";
import Navbar from "../components/NavBar";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[]; 
  type: string;
  trade?: boolean; //trade or sell
  brand: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // 🔹 Fetch listings from Firestore and auto-refresh
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "listings"), (snapshot) => {
      setListings(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Listing[]
      );
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Delete listing
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await deleteDoc(doc(db, "listings", id));
      setSelectedListing(null);
    }
  };

  // 🔹 Edit listing
  const handleEdit = async () => {
    if (!selectedListing) return;
    const updatedTitle = prompt("Enter new title:", selectedListing.title);
    const updatedPrice = prompt("Enter new price:", selectedListing.price);

    if (updatedTitle && updatedPrice) {
      await updateDoc(doc(db, "listings", selectedListing.id), {
        title: updatedTitle,
        price: updatedPrice,
      });
      setSelectedListing(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/*Navbar */}
      <Navbar />

      {/* 🔹 Header with Create Button */}
      <div className="flex justify-between items-center px-8 pt-6">
        <h1 className="text-3xl font-bold text-gray-800">Marketplace</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          + Create Listing
        </button>
      </div>

      {/* 🔹 Listings Grid */}
      <div className="p-6">
        {listings.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No listings yet. Be the first to post!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg cursor-pointer transition"
                onClick={() => setSelectedListing(listing)}
              >
                {/*Display first image in array */}
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="h-48 w-full object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="h-48 w-full bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                <h2 className="text-lg font-semibold">{listing.title}</h2>
                <p className="text-gray-600 line-clamp-2">{listing.description}</p>
                <p className="text-indigo-600 font-bold mt-2">${listing.price}</p>
                {listing.type === "trade" && (
                  <span className="text-xs text-green-600 font-medium">
                    Available for Trade
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 Create Listing Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <DialogTitle className="text-xl font-bold mb-4">
              Create a New Listing
            </DialogTitle>
            <ListingForm onSuccess={() => setIsModalOpen(false)} />
          </DialogPanel>
        </div>
      </Dialog>

      {/* 🔹 Listing Preview Modal */}
      <Dialog
        open={!!selectedListing}
        onClose={() => setSelectedListing(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-xl">
            {selectedListing && (
              <>
                <DialogTitle className="text-2xl font-bold mb-3">
                  {selectedListing.title}
                </DialogTitle>

                {/*Image carousel or first image */}
                {selectedListing.images && selectedListing.images.length > 0 ? (
                  <img
                    src={selectedListing.images[0]}
                    alt={selectedListing.title}
                    className="h-64 w-full object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="h-64 w-full bg-gray-200 rounded-xl mb-4 flex items-center justify-center text-gray-500">
                    No Image Available
                  </div>
                )}

                <p className="text-gray-700 mb-2">{selectedListing.description}</p>
                <p className="text-indigo-600 font-semibold text-lg mb-2">
                  ${selectedListing.price}
                </p>
                {selectedListing.type === "trade" && (
                  <p className="text-green-600 font-medium">
                    Available for Trade
                  </p>
                )}
                {selectedListing.brand && (
                  <p className="text-gray-500 text-sm mt-1">
                    Brand: {selectedListing.brand}
                  </p>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => handleEdit()}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedListing.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
