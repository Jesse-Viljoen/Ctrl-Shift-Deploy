// Firebase SDK Imports
import { initializeApp } from "firebase/app";
import { getDatabase, ref as dbRef, get as dbGet, update } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com",
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app); // ✅ Required to use Realtime Database

// 🔄 Live update driver field
function liveUpdateDriver(driverId, field, value) {
  const updates = {};
  updates[`drivers/${driverId}/${field}`] = value;
  update(dbRef(db), updates);
}

// 👤 Live update user data
function liveUpdateUser(userId, field, value) {
  const updates = {};
  updates[`users/${userId}/${field}`] = value;
  update(dbRef(db), updates);
}

// 📲 WhatsApp link generator
function getWhatsAppLink(phoneNumber, message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}

// 🔽 Sort rides from newest to oldest
const rides = [
  { id: 1, timestamp: "2025-04-24T12:30:00Z" },
  { id: 2, timestamp: "2025-04-24T14:00:00Z" }
];

rides.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
console.log("Sorted (Newest to Oldest):", rides);

// 📷 Fetch and display face image from: parent1/securityVerification/faceImageUrl
async function fetchUserFaceImage(parentId) {
  try {
    const selfieRef = dbRef(db, `${parentId}/securityVerification/faceImageUrl`);
    const selfieSnap = await dbGet(selfieRef);

    if (selfieSnap.exists()) {
      const faceImageUrl = selfieSnap.val();
      console.log("Face Image URL:", faceImageUrl);

      document.getElementById("selfieImg").src = faceImageUrl;
    } else {
      console.log("No faceImageUrl found at path.");
    }
  } catch (error) {
    console.error("Error fetching image:", error);
  }
}

async function fetchUserFaceImage(parentId) {
  try {
    const selfieRef = dbRef(db, `${parentId}/securityVerification/faceImageUrl`);
    const selfieSnap = await dbGet(selfieRef);

    if (selfieSnap.exists()) {
      const faceImageUrl = selfieSnap.val();
      console.log("Face Image URL:", faceImageUrl);

      // ✅ Sets the image source in the HTML
      document.getElementById("selfieImg").src = faceImageUrl;
    } else {
      console.log("No faceImageUrl found at path.");
    }
  } catch (error) {
    console.error("Error fetching image:", error);
  }
}


