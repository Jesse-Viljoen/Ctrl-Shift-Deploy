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

// === SUBSCRIPTION POPUP ===
document.getElementById("subscribeBtn").addEventListener("click", () => {
  document.getElementById("popup").style.display = "block";
  document.getElementById("popup-overlay").style.display = "block";
});

window.closePopup = function () {
  document.getElementById("popup").style.display = "none";
  document.getElementById("popup-overlay").style.display = "none";
};

window.confirmSubscription = async function () {
  const selectedPlan = document.getElementById("planSelect").value;
  const cardNumber = document.getElementById("cardInput").value.trim();
  const user = auth.currentUser;

  if (!user) return alert("You must be logged in to subscribe.");
  if (!cardNumber || cardNumber.length < 12) return alert("Please enter a valid card number.");

  // Simulate payment processing
  alert("Processing payment...");

  // Save subscription data
  const path = `users/${user.uid}/subscription`;
  await set(ref(db, path), {
    plan: selectedPlan,
    status: "active",
    startDate: new Date().toISOString().split("T")[0],
    paymentMethod: "MockCard",
    cardNumber: `**** **** **** ${cardNumber.slice(-4)}`
  });

  alert(`Subscribed to ${selectedPlan} plan successfully!`);
  closePopup();
};

// === ACCOUNT DELETION ===
document.getElementById('deleteAccountForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const user = auth.currentUser;

  if (user) {
    const userId = user.uid;
    const isAdmin = userId === 'GX8o6J3ySsOTMaXPuTosEkm51Hl1';

    if (isAdmin) {
      remove(ref(db, `users/${userId}`))
        .then(() => deleteUser(user))
        .then(() => alert("The admin account has been deleted."))
        .catch((error) => {
          console.error("Error deleting admin account:", error);
          alert("Failed to delete admin account.");
        });
    } else if (user.email === email) {
      remove(ref(db, `users/${userId}`))
        .then(() => deleteUser(user))
        .then(() => alert("Your account has been deleted."))
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred while deleting your account.");
        });
    } else {
      alert("You do not have permission to delete this account.");
    }
  } else {
    alert("No authenticated user found.");
  }
});
