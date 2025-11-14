import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from "firebase/firestore";

export default function ShoppingCartPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [cartItems, setCartItems] = useState<any[]>([]);

  if (!currentUser) {
    navigate("/"); // redirect if not logged in
    return null;
  }

  const userCartRef = collection(db, "users", currentUser.uid, "cart");

  // Load cart in realtime
  useEffect(() => {
    const q = query(userCartRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ docId: doc.id, ...doc.data() });
      });
      setCartItems(items);
    });

    return () => unsubscribe();
  }, []);

  // Add item from listing page
  useEffect(() => {
    const item = location.state?.item;
    if (item) {
      // Check if item already exists in cart
      const exists = cartItems.some((cartItem) => cartItem.id === item.id);
      if (!exists) {
        const newDocRef = doc(userCartRef, item.id); // use listing ID as docId to prevent duplicates
        setDoc(newDocRef, {
          id: item.id,
          title: item.title,
          price: parseFloat(item.price),
          image: item.image || "",
          description: item.description || "",
          ownerId: item.ownerId || "", // store ownerId for checkout messages
        });
      }
    }
  }, [location.state, cartItems]);

  const getTotal = () =>
    cartItems.reduce((total, item) => total + parseFloat(item.price || 0), 0).toFixed(2);

  const handleRemove = async (docId: string) => {
    await deleteDoc(doc(userCartRef, docId));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const confirmationNumber = Math.floor(Math.random() * 900000 + 100000); // 6-digit random number

    try {
      for (const item of cartItems) {
        // 1️⃣ Send message to owner
        const ownerInboxRef = collection(db, "users", item.ownerId, "inbox");
        await addDoc(ownerInboxRef, {
          from: currentUser.uid,
          message: `Your item "${item.title}" has been purchased! Confirmation #: ${confirmationNumber}`,
          timestamp: new Date(),
          type: "sale",
          itemId: item.id,
        });

        // 2️⃣ Save order to buyer's purchase list
        const buyerOrdersRef = collection(db, "users", currentUser.uid, "purchases");
        await addDoc(buyerOrdersRef, {
          itemId: item.id,
          title: item.title,
          price: item.price,
          confirmationNumber,
          purchasedAt: new Date(),
        });

        // 3️⃣ Remove item from cart
        await deleteDoc(doc(userCartRef, item.docId));
      }

      // 4️⃣ Show thank-you message
      alert(
        `Thank you for your purchase! The following items will be shipped soon!\nConfirmation #: ${confirmationNumber}`
      );

      navigate("/"); // redirect after checkout
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed. Please try again.");
    }
  };

  if (cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Cart is Empty</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          ← Continue Shopping
        </button>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">🛒 Your Shopping Cart</h1>

        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border rounded-xl p-4 bg-gray-50 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                  <p className="text-gray-500 mt-1">{item.description || "No description available."}</p>
                  <p className="text-indigo-600 font-bold mt-2">${item.price}</p>
                </div>
              </div>

              <button
                onClick={() => handleRemove(item.docId)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="mt-8 border-t pt-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-800">
            Total: <span className="text-indigo-600">${getTotal()}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 transition"
            >
              ← Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition font-semibold"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
