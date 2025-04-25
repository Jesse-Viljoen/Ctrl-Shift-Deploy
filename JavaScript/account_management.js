import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, update, remove } from "firebase/database";
import { getAuth, onAuthStateChanged, deleteUser } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com", // fixed typo
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Elements
const profilePhoto = document.getElementById("profilePhoto");
const nameInput = document.getElementById("nameInput");
const roleInput = document.getElementById("roleInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const childNameInput = document.getElementById("childNameInput");

const saveBtn = document.getElementById("saveBtn");
const discardBtn = document.getElementById("discardBtn");
const viewSubscriptionBtn = document.getElementById("viewSubscriptionBtn");
const updateSubscriptionBtn = document.getElementById("updateSubscriptionBtn");
const deleteSubscriptionBtn = document.getElementById("deleteSubscriptionBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

let currentUID = null;
let originalData = {};

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUID = user.uid;
    const userRef = ref(db, `users/${currentUID}`);

    get(userRef).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        originalData = { ...data };

        // Populate fields
        profilePhoto.src = data.faceimageUrl || "";
        nameInput.value = data.name || "";
        roleInput.value = data.role || "";
        emailInput.value = data.email || "";
        phoneInput.value = data.phone || "";
        childNameInput.value = data.childName || "";
      } else {
        alert("User data not found.");
      }
    });
  }
});

// Save changes
saveBtn.addEventListener("click", () => {
  const updates = {
    name: nameInput.value,
    role: roleInput.value,
    email: emailInput.value,
    phone: phoneInput.value,
    childName: childNameInput.value,
  };

  update(ref(db, `users/${currentUID}`), updates)
    .then(() => alert("Profile updated!"))
    .catch((error) => alert("Update failed: " + error.message));
});

// Discard changes
discardBtn.addEventListener("click", () => {
  nameInput.value = originalData.name || "";
  roleInput.value = originalData.role || "";
  emailInput.value = originalData.email || "";
  phoneInput.value = originalData.phone || "";
  childNameInput.value = originalData.childName || "";
});

// View subscription
viewSubscriptionBtn.addEventListener("click", () => {
  const subRef = ref(db, `users/${currentUID}/subscription`);
  get(subRef).then(snapshot => {
    if (snapshot.exists()) {
      alert("Subscription Info:\n" + JSON.stringify(snapshot.val(), null, 2));
    } else {
      alert("No subscription found.");
    }
  });
});

// Update subscription
updateSubscriptionBtn.addEventListener("click", () => {
  const newSub = prompt("Enter new subscription plan (e.g. Gold/Basic):");
  if (newSub) {
    set(ref(db, `users/${currentUID}/subscription/plan`), newSub)
      .then(() => alert("Subscription updated!"))
      .catch(err => alert("Error: " + err.message));
  }
});

// Delete subscription
deleteSubscriptionBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete your subscription?")) {
    remove(ref(db, `users/${currentUID}/subscription`))
      .then(() => alert("Subscription deleted."))
      .catch(err => alert("Error: " + err.message));
  }
});

// Delete account
deleteAccountBtn.addEventListener("click", () => {
  if (confirm("This will delete your account permanently. Continue?")) {
    remove(ref(db, `users/${currentUID}`)).then(() => {
      deleteUser(auth.currentUser)
        .then(() => {
          alert("Account deleted.");
          window.location.href = "/"; // redirect
        })
        .catch(err => alert("Error deleting user: " + err.message));
    });
  }
});

