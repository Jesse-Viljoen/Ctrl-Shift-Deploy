// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getDatabase, ref as dbRef, get as dbGet } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.firebasestorage.app",
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

async function fetchUserData() {
  const user = auth.currentUser;

  if (!user) {
    alert("No user logged in.");
    return;
  }

  try {
    // Fetch Firestore user details
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("User Firestore Data:", userData);

      // Fetch Realtime DB selfie using username
      const username = userData.username;
      const selfieRef = dbRef(rtdb, `users/${username}`);
      const selfieSnap = await dbGet(selfieRef);

      if (selfieSnap.exists()) {
        const selfieData = selfieSnap.val();
        console.log("Selfie Data:", selfieData);

        // Display data (example)
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






