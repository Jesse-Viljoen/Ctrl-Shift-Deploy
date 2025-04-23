// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getDatabase, ref as dbRef, get as dbGet } from "firebase/database";
import { getAuth } from "firebase/auth";

// ✅ Firebase configuration (with corrected storageBucket)
const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com", // ✅ Corrected
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();
const rtdb = getDatabase();
const auth = getAuth();

// ✅ Fetch user data from Firestore and Realtime Database
async function fetchUserData() {
  const user = auth.currentUser;

  if (!user) {
    alert("No user logged in.");
    return;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("User Firestore Data:", userData);

      // ✅ Ensure `username` exists in Firestore
      const username = userData.username;
      if (!username) {
        alert("Username not found in Firestore data.");
        return;
      }

      const selfieRef = dbRef(rtdb, `users/${username}`);
      const selfieSnap = await dbGet(selfieRef);

      if (selfieSnap.exists()) {
        const selfieData = selfieSnap.val();
        console.log("Selfie Data:", selfieData);

        // ✅ Update DOM with user info
        document.getElementById('userInfo').innerText =
          `Name: ${userData.full_name}\nEmail: ${userData.email}\nPhone: ${userData.phone}`;

        document.getElementById('selfieImg').src = selfieData.selfieURL;

      } else {
        console.log("No selfie found for username.");
      }
    } else {
      console.log("No Firestore user document found.");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Failed to fetch user data.");
  }
}

// ✅ Automatically run fetch on page load
window.onload = fetchUserData;






