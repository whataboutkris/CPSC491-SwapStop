import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

import { useNavigate } from "react-router-dom";


export default function EditProfile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;


  const [username, setUsername] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!uid) {
      setError("No user logged in.");
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      setLoading(true);
      try {
        const userDocRef = doc(db, "users", uid!);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUsername(data.username || "");
          setProfilePicUrl(data.profilePicUrl || "");
        }
      } catch (e) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [uid]);

  async function handleSave() {
    if (!uid) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      setSaving(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", uid);
      await setDoc(
        userDocRef,
        { username: username.trim(), profilePicUrl: profilePicUrl.trim() },
        { merge: true }
      );
      setSuccess(true);
    } catch (e) {
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-12">
      <h2 className="text-2xl font-bold mb-6 text-[#00244E]">Edit Profile</h2>
      <label className="block mb-4">
        <span className="block text-gray-700 mb-1">Username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter your username"
        />
      </label>

      <label className="block mb-4">
        <span className="block text-gray-700 mb-1">Profile Picture URL</span>
        <input
          type="text"
          value={profilePicUrl}
          onChange={(e) => setProfilePicUrl(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter image URL"
        />
      </label>

      {profilePicUrl && (
        <div className="mb-4">
          <span className="block text-gray-700 mb-1">Preview</span>
          <img
            src={profilePicUrl}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover border"
          />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-2 rounded text-white font-semibold ${
          saving ? "bg-gray-400" : "bg-[#FF7900] hover:bg-yellow-500"
        }`}
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>

      {/* Back to Profile button */}
      {uid && (
        <button
          onClick={() => navigate(`/user/${uid}`)}
          className="w-full mt-4 py-2 rounded text-white font-semibold bg-gray-600 hover:bg-gray-700"
        >
          Back to Profile
        </button>
      )}

      {success && <p className="mt-4 text-green-600">Profile saved successfully!</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>



  );
}
