

// Firebase configuration
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

firebase.initializeApp(firebaseConfig);
firebase.analytics();
const auth = firebase.auth();

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// Notification helper
function showNotification(message, isError = false) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = isError ? "error" : "success";
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 5000);
}

// Handle password reset
document.getElementById("resetPasswordForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const resetButton = document.getElementById("resetButton");

  if (!email || !email.includes('@')) {
    showNotification("Please enter a valid email address.", true);
    return;
  }

  resetButton.disabled = true;

  try {
    await sendPasswordResetEmail(auth, email);
    showNotification("Password reset email sent! Please check your inbox.");
  } catch (error) {
    console.error("Password reset error:", error);
    showNotification("Error: " + error.message, true);
  } finally {
    resetButton.disabled = false;
  }
});
