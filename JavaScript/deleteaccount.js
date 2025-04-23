// Import the necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, deleteUser } from "firebase/auth";
import { getDatabase, ref, remove } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com", // Fixed the storageBucket URL typo
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Handle account deletion logic
document.getElementById('deleteAccountForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value; // This could be from form or session
    const user = auth.currentUser;

    if (user) {
        const userId = user.uid;

        // Admin check logic (use Firestore or Realtime Database for more robust checking)
        const isAdmin = userId === 'adminUID';  // Replace 'adminUID' with the actual admin UID or check against a database

        if (isAdmin) {
            // Admin can delete any user's account
            const userRef = ref(db, 'users/' + userId); // Use userId, not email (email might have special characters)
            remove(userRef)  // Deleting user data from the database
                .then(() => {
                    console.log("User data deleted successfully");
                })
                .catch((error) => {
                    console.error("Error deleting user data:", error);
                });

            // Proceed to delete the user from Firebase Authentication
            deleteUser(user)
                .then(() => {
                    console.log("User account deleted successfully");
                    alert("The user account has been deleted.");
                })
                .catch((error) => {
                    console.error("Error deleting user account:", error);
                    alert("An error occurred while deleting the user account.");
                });
        } else if (userId === email) {
            // Regular user can only delete their own account
            deleteUser(user)
                .then(() => {
                    console.log("Your account has been deleted successfully.");
                    alert("Your account has been deleted.");
                })
                .catch((error) => {
                    console.error("Error deleting your account:", error);
                    alert("An error occurred while deleting your account.");
                });
        } else {
            alert("You do not have permission to delete this account.");
        }
    } else {
        alert("No authenticated user found.");
    }
});

                    

                                                   
