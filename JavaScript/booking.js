// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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

// Live update driver field
function liveUpdateDriver(driverId, field, value) {
  const updates = {};
  updates[`drivers/${driverId}/${field}`] = value;
  update(ref(db), updates);
}

function liveUpdateUser(userId, field, value) {
  const updates = {};
  updates[`users/${userId}/${field}`] = value;
  update(ref(db), updates);
}

function getWhatsAppLink(phoneNumber, message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${00628859061111}?text=${encoded}`;
}

// Example
const waLink = getWhatsAppLink("00628859061111", "Hi! I'm contacting you from our transport app.");

// add the live saving rides


rides.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

console.log("Sorted (Newest to Oldest):", rides);


