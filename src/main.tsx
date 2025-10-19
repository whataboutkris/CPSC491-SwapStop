import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MessagePage from "./pages/MessagePage";
import InboxPage from "./pages/InboxPage";
import Home from "./pages/Home";
import Listings from "./pages/ListingsPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPage from "./pages/UserPage";
import AddListing from "./pages/AddListing";
import EditProfile from "./pages/EditProfile";


import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/user/:userId" element={<UserPage />} />
        <Route path="/messages/:receiverId" element={<MessagePage />} />
        <Route path="/add-listing" element={<AddListing />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/inbox" element={<InboxPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);