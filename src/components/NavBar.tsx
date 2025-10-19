import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "../assets/SwapStop-Logo-Transparent.png";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [profilePicUrl, setProfilePicUrl] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close the mobile menu after click
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on ESC and click-away, close keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onClickAway(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickAway);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickAway);
    };
  }, [open]);

  //freeze page scroll when menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    //stop overflow
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* Revisit to update profile picture with users image*/
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as any;
            setUsername(data.username || undefined);
            setProfilePicUrl(
              data.profilePicUrl ||
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
            );
          }
        } catch (error) {
          console.error("Failed to fetch user data from Firestore:", error);
        }
      } else {
        setUsername(undefined);
        setProfilePicUrl(undefined);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
      setUsername(undefined);
      setProfilePicUrl(undefined);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const NavLinks = useMemo(
    () => (
      <>
        <Link to="/home" className="hover:text-indigo-300 transition-colors">Home</Link>
        <Link to="/listings" className="hover:text-indigo-300 transition-colors">Listings</Link>
        <Link to="/users" className="hover:text-indigo-300 transition-colors">Users</Link>
        <Link to="/about" className="hover:text-indigo-300 transition-colors">About</Link>
        <Link to="/contact" className="hover:text-indigo-300 transition-colors">Contact</Link>
      </>
    ),
    []
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F3F8C] text-white shadow-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="SwapStop Logo NavBar"
            className="h-12 w-auto hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Desktop links about? (≥640px) */}
        <div className="hidden sm:flex items-center gap-6 text-lg font-medium">
          {NavLinks}
        </div>

        {/* Desktop actions (≥640px) */}
        <div className="hidden sm:flex gap-4 items-center">
          {!user ? (
            <>
              <Link to="/register">
                <Button className="bg-white text-indigo-800 hover:bg-gray-100">
                  Sign Up
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-transparent border border-white hover:bg-white hover:text-indigo-800">
                  Login
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link
                to={`/user/${user.uid}`}
                className="flex items-center gap-2 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <img
                  src={profilePicUrl}
                  alt={username ?? user.email ?? "User"}
                  className="w-8 h-8 rounded-full object-cover border"
                />
                <span className="text-base">{username ?? user.email ?? "User"}</span>
              </Link>
              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Hamburger menu, approx small screens(only <640px) */}
        <button
          ref={btnRef}
          type="button"
          aria-label="Toggle menu"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="sm:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
        >
          {open ? (
            // X close icon
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          ) : (
            // hamburger Menu icon
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile panel approx size(<640px) */}
      <div
        id="mobile-menu"
        ref={panelRef}
        className={`sm:hidden overflow-hidden border-t border-white/10 transition-all duration-300 ease-out
          ${open ? "max-h-[70vh] opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}
      >
        <div className="px-6 py-4 space-y-4 text-lg font-medium">
          {/* Links */}
          <div className="flex flex-col gap-3">
            {NavLinks}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/20 my-2" />

          {/* Auth area */}
          {!user ? (
            <div className="flex gap-3">
              <Link className="flex-1" to="/register">
                <Button className="w-full bg-white text-indigo-800 hover:bg-gray-100">
                  Sign Up
                </Button>
              </Link>
              <Link className="flex-1" to="/login">
                <Button className="w-full bg-transparent border border-white hover:bg-white hover:text-indigo-800">
                  Login
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <Link
                to={`/user/${user.uid}`}
                className="flex items-center gap-3 hover:text-indigo-300 transition-colors"
              >
                <img
                  src={profilePicUrl}
                  alt={username ?? user.email ?? "User"}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <span className="text-base">{username ?? user.email ?? "User"}</span>
              </Link>
              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
