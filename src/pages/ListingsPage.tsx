import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import ListingForm from "../components/ListingForm";
import Navbar from "../components/NavBar";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { estimatePriceFromImage } from "../GoogleAI/AiPriceEstimator";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  type: string;
  trade?: boolean;
  brand: string;
  ownerId: string;
}

interface PriceBreakdownItem {
  title: string;
  price: number;
  url: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [aiEstimates, setAiEstimates] = useState<Record<string, string | null>>({});
  const [aiBreakdown, setAiBreakdown] = useState<Record<string, PriceBreakdownItem[]>>({});
  const [isEstimating, setIsEstimating] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState<Record<string, boolean>>({});
  const [ownerMap, setOwnerMap] = useState<Record<string, { username: string; profilePicUrl: string }>>({});
  const [tradeFormVisible, setTradeFormVisible] = useState(false);
  const [tradeItem, setTradeItem] = useState({ title: "", condition: "", image: "", price: "" });
  const [uploadingImage, setUploadingImage] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "listings"), (snapshot) => {
      setListings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Listing[]);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    listings.forEach(async (listing) => {
      if (listing.ownerId && !ownerMap[listing.ownerId]) {
        const userSnap = await getDoc(doc(db, "users", listing.ownerId));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setOwnerMap((prev) => ({
            ...prev,
            [listing.ownerId]: {
              username: data.username || "Unknown User",
              profilePicUrl:
                data.profilePicUrl ||
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
            },
          }));
        }
      }
    });
  }, [listings, ownerMap]);


  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await deleteDoc(doc(db, "listings", id));
      setSelectedListing(null);
    }
  };


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

  
  const handleRunAI = async () => {
    if (!selectedListing || !selectedListing.images?.[0]) return;
    setIsEstimating(true);

    try {
      const { avgPrice, listings: aiListings } = await estimatePriceFromImage(selectedListing.images[0]);
      if (!avgPrice) {
        setAiEstimates((prev) => ({ ...prev, [selectedListing.id]: "No prices found!" }));
        setAiBreakdown((prev) => ({ ...prev, [selectedListing.id]: [] }));
        return;
      }

      const top5 =
        aiListings?.slice(0, 5).map((item: any) => ({
          title: item.title,
          price: typeof item.price === "string" ? parseFloat(item.price.replace(/[^0-9.]/g, "")) : item.price,
          url: item.url,
        })) || [];

      setAiEstimates((prev) => ({ ...prev, [selectedListing.id]: avgPrice }));
      setAiBreakdown((prev) => ({ ...prev, [selectedListing.id]: top5 }));
    } catch (err) {
      console.error("AI price estimation failed:", err);
      alert("AI price estimation failed.");
    } finally {
      setIsEstimating(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `trade-items/${currentUser?.uid}-${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setTradeItem((prev) => ({ ...prev, image: url }));
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed!");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTradeSubmit = async () => {
    if (!selectedListing || !currentUser) return;
    if (!tradeItem.title || !tradeItem.condition) {
      alert("Please fill in item title and condition.");
      return;
    }
    await addDoc(collection(db, "trades"), {
      listingId: selectedListing.id,
      requesterId: currentUser.uid,
      tradeItem,
      status: "pending",
      createdAt: new Date(),
    });
    alert("✅ Trade offer sent!");
    setTradeFormVisible(false);
    setTradeItem({ title: "", condition: "", image: "", price: "" });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="flex justify-between items-center px-8 pt-6">
        <h1 className="text-3xl font-bold text-gray-800">Marketplace</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          + Create Listing
        </button>
      </div>

      {/* Listings Grid */}
      <div className="p-6">
        {listings.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No listings yet. Be the first to post!</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg cursor-pointer transition"
                onClick={() => setSelectedListing(listing)}
              >
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
                  <span className="text-xs text-green-600 font-medium">Available for Trade</span>
                )}
                <div className="flex items-center mt-2">
                  <img
                    src={ownerMap[listing.ownerId]?.profilePicUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                    alt={ownerMap[listing.ownerId]?.username || "Unknown User"}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <Link
                    to={`/user/${listing.ownerId}`}
                    className="text-blue-500 hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ownerMap[listing.ownerId]?.username || "Unknown User"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true"/>
        
        <div className="fixed inset-0 overflow-y-auto j">
          
            <div className= "flex min-h-full items-start sm:items-center p-5 justify-center">
  
            <DialogPanel className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl relative max-h-[90vh] overflow-y-auto">
          

              <DialogTitle className="text-xl font-bold mb-4"></DialogTitle>
              <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl"
                  onClick={() => setIsModalOpen(false)}>
                  ×
                </button>
              <ListingForm onSuccess={() => setIsModalOpen(false)} />
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Listing Preview Modal */}
      <Dialog open={!!selectedListing} onClose={() => setSelectedListing(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-6">
          <DialogPanel className="bg-white rounded-2xl p-6 max-w-xl mx-auto w-full shadow-xl relative max-h-[90vh] overflow-y-auto">
            {selectedListing && (
              <>
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl"
                  onClick={() => setSelectedListing(null)}
                >
                  ×
                </button>

                <DialogTitle className="text-2xl font-bold mb-3">{selectedListing.title}</DialogTitle>
                
                  {selectedListing.images?.length > 0 ? (
                    <div className= "mb-4 flex justify-center">
                      <div className="w-full max-h-[55vh] rounded 2-xl bg-white-100 flex items- center justify-center overflow-hidden">
                        <img
                          src={selectedListing.images[0]}
                          alt={selectedListing.title}
                          className="max-h-[55vh] w-auto object-contain"
                        />
                      </div>
                    </div>
                ) : (
                  <div className="h-64 w-full bg-gray-200 rounded-xl mb-4 flex items-center justify-center text-gray-500">
                    No Image Available
                  </div>
                )}

                <p className="text-gray-700 mb-2">{selectedListing.description}</p>
                <p className="text-indigo-600 font-semibold text-lg mb-2">${selectedListing.price}</p>

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                  {/* BUY button */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!currentUser || !selectedListing) {
                        alert("You must be logged in to buy an item.");
                        return;
                      }

                      try {
                        const cartRef = doc(db, "users", currentUser.uid, "cart", selectedListing.id);
                        const existing = await getDoc(cartRef);
                        if (existing.exists()) {
                          alert("✅ This item is already in your cart!");
                        } else {
                          await setDoc(cartRef, {
                            id: selectedListing.id,
                            title: selectedListing.title,
                            price: parseFloat(selectedListing.price),
                            image: selectedListing.images?.[0] || "",
                            description: selectedListing.description || "",
                          });
                          alert("🛒 Item added to your cart!");
                        }

                        navigate("/ShoppingCartPage");
                      } catch (err) {
                        console.error("Error adding to cart:", err);
                        alert("❌ Failed to add item to cart. Please try again.");
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition font-semibold"
                  >
                    Buy
                  </button>

                  {/* MESSAGE SELLER BUTTON */}
                  {currentUser?.uid !== selectedListing.ownerId && (
                    <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!currentUser) {
                        alert("You must be logged in to message the seller.");
                        return;
                      }
                      const chatId = [currentUser.uid, selectedListing.ownerId].sort().join("_");

                       navigate(`/chat/${chatId}`, {
                        state: { listing: selectedListing, sellerId: selectedListing.ownerId },
                      });
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition font-semibold"
                    >
                      Message Seller
                      </button>
                    )}
                  

                  {/* Trade button */}
                  <button
                    onClick={() => setTradeFormVisible((prev) => !prev)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-semibold"
                  >
                    Trade
                  </button>

                  {currentUser?.uid === selectedListing.ownerId && (
                    <>
                      <button onClick={handleEdit} className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(selectedListing.id)} className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition">
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {/* Trade Form */}
                {tradeFormVisible && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-xl border border-gray-300">
                    <h3 className="font-semibold mb-2">Your Trade Offer</h3>

                    <input
                      type="text"
                      placeholder="Item Title"
                      value={tradeItem.title}
                      onChange={(e) => setTradeItem((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full border p-2 rounded mb-2"
                    />

                    <select
                      value={tradeItem.condition}
                      onChange={(e) => setTradeItem((prev) => ({ ...prev, condition: e.target.value }))}
                      className="w-full border p-2 rounded mb-2"
                    >
                      <option value="">Select Condition</option>
                      <option value="Mint">Mint</option>
                      <option value="New">New</option>
                      <option value="Lightly Used">Lightly Used</option>
                      <option value="Used">Used</option>
                    </select>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                      className="w-full mb-2"
                    />

                    {uploadingImage && <p className="text-gray-500 text-sm mb-2">Uploading image...</p>}
                    {tradeItem.image && <img src={tradeItem.image} alt="Trade Item" className="h-24 mb-2 rounded" />}

                    <input
                      type="text"
                      placeholder="Price (optional)"
                      value={tradeItem.price}
                      onChange={(e) => setTradeItem((prev) => ({ ...prev, price: e.target.value }))}
                      className="w-full border p-2 rounded mb-2"
                    />

                    <button
                      onClick={handleTradeSubmit}
                      className="bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition font-semibold"
                    >
                      Send Trade Offer
                    </button>
                  </div>
                )}

                {/* AI Estimator */}
                <div className="absolute bottom-4 right-6">
                  {!aiEstimates[selectedListing.id] ? (
                    <button
                      onClick={handleRunAI}
                      disabled={isEstimating}
                      className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-indigo-700 transition font-semibold shadow-sm"
                    >
                      {isEstimating ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                          <span>Estimating...</span>
                        </>
                      ) : (
                        <>
                          <span>💰</span>
                          <span>Price Estimator</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-lg text-sm shadow-sm">
                      <span className="text-gray-700 font-medium">💡 {aiEstimates[selectedListing.id]}</span>
                      <button
                        onClick={() =>
                          selectedListing &&
                          setShowBreakdown((prev) => ({ ...prev, [selectedListing.id]: !prev[selectedListing.id] }))
                        }
                        className="bg-indigo-200 text-indigo-800 font-bold rounded-full w-5 h-5 flex items-center justify-center hover:bg-indigo-300 transition"
                      >
                        i
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                {selectedListing &&
                  showBreakdown[selectedListing.id] &&
                  aiBreakdown[selectedListing.id] && (
                    <div className="absolute bottom-16 right-6 bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm w-80 max-h-56 overflow-y-auto">
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">🧾 Price Breakdown:</h3>
                      {aiBreakdown[selectedListing.id].length > 0 ? (
                        <ul className="space-y-2">
                          {aiBreakdown[selectedListing.id].map((item: PriceBreakdownItem, index: number) => (
                            <li key={index} className="border-b border-gray-100 pb-1 last:border-none">
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                {item.title.length > 35 ? item.title.slice(0, 35) + "..." : item.title}
                              </a>
                              {item.price && <div className="text-gray-600 text-xs">${item.price.toFixed(2)}</div>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No comparable prices found.</p>
                      )}
                    </div>
                  )}
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
