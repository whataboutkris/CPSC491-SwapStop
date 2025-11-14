import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";
import cartIcon from "../assets/reshot-icon-full-cart-SX5ZWAJ3LC.svg";

interface CartButtonProps {
  onClick?: () => void;
  className?: string;
}

const CartButton: React.FC<CartButtonProps> = ({ onClick, className = "" }) => {
  const [count, setCount] = useState<number>(0);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const cartRef = collection(db, "users", currentUser.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      setCount(snapshot.size); // real number of items in cart
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center p-2 rounded-xl hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white ${className}`}
      aria-label="Open cart"
    >
      {/* icon */}
      <img src={cartIcon} alt="Cart" className="w-7 h-7 drop-shadow-sm" />

      {/* number Badge */}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-md">
          {count}
        </span>
      )}
    </button>
  );
};

export default CartButton;
