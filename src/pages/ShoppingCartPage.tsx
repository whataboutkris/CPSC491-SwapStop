import { useLocation, useNavigate } from "react-router-dom";

export default function ShoppingCartPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;

  if (!item) return <p className="p-6">No item in cart.</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      <div className="border p-4 rounded-lg mb-4 flex gap-4">
        {item.images?.[0] && (
          <img src={item.images[0]} alt={item.title} className="w-24 h-24 object-cover rounded" />
        )}
        <div>
          <h2 className="font-semibold">{item.title}</h2>
          <p className="text-indigo-600 font-bold">${item.price}</p>
        </div>
      </div>
      <button
        onClick={() => alert("Checkout coming soon!")}
        className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition w-full"
      >
        Checkout
      </button>
      <button
        onClick={() => navigate(-1)}
        className="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-300 transition w-full"
      >
        Back
      </button>
    </div>
  );
}
