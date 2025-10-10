import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  const [username, setUsername] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch user data
  useEffect(() => {
    if (!uid) {
      setError("No user logged in.");
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      setLoading(true);
      try {
        const userDocRef = doc(db, "users", uid);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProfilePicUrl(URL.createObjectURL(e.target.files[0])); // preview
    }
  };

  const handleSave = async () => {
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
      let uploadedUrl = profilePicUrl;

      // Upload file if user selected one
      if (file) {
        const storageRef = ref(storage, `users/${uid}/profilePic.jpg`);
        await uploadBytes(storageRef, file);
        uploadedUrl = await getDownloadURL(storageRef);
      }

      const userDocRef = doc(db, "users", uid);
      await setDoc(
        userDocRef,
        { username: username.trim(), profilePicUrl: uploadedUrl },
        { merge: true }
      );

      setSuccess(true);
      setFile(null);
    } catch (e) {
      console.error(e);
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#FF7900]">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00244E] px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-[#00244E] text-center">Edit Profile</h2>

        {/* Username */}
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

        {/* Profile Picture */}
        <label className="block mb-4">
          <span className="block text-gray-700 mb-1">Profile Picture</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        {/* Preview */}
        {profilePicUrl && (
          <div className="mb-4 text-center">
            <span className="block text-gray-700 mb-1">Preview</span>
            <img
              src={profilePicUrl}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover border mx-auto"
            />
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-2 rounded text-white font-semibold ${
            saving ? "bg-gray-400" : "bg-[#FF7900] hover:bg-yellow-500"
          }`}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>

        {/* Back to Profile Button */}
        {uid && (
          <button
            onClick={() => navigate(`/user/${uid}`)}
            className="w-full mt-4 py-2 rounded text-white font-semibold bg-gray-600 hover:bg-gray-700"
          >
            ← Back to Profile
          </button>
        )}

        {success && <p className="mt-4 text-green-600 text-center">Profile saved successfully!</p>}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}
