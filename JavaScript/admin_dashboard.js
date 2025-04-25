import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com", // ✅ fixed typo
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(); // ✅ now declared

// Submit application
function submitApplication() {
  const studentName = document.getElementById("studentName").value;
  const school = document.getElementById("school").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const vehicleType = document.getElementById("vehicleType").value;
  const applicationStatus = document.getElementById("applicationStatus").value;

  if (!studentName || !email) {
    alert("Please fill in all required fields.");
    return;
  }

  const uniqueId = email.replace(/[.@]/g, "_");

  set(ref(database, 'applications/' + uniqueId), {
    studentName,
    school,
    phone,
    email,
    vehicleType,
    applicationStatus,
    totalApplications: 1,
    totalApplicationsApproved: applicationStatus === "approved" ? 1 : 0,
    totalApplicationsRejected: applicationStatus === "rejected" ? 1 : 0
  })
  .then(() => {
    alert("Application submitted!");
  })
  .catch((error) => {
    console.error("Database error:", error);
    alert("Failed to save application.");
  });
}

// Fetch application stats
function fetchApplicationStats() {
  const appsRef = ref(database, 'applications');

  get(appsRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let total = 0, approved = 0, rejected = 0;

        for (const id in data) {
          const app = data[id];
          total += 1;
          if (app.applicationStatus === 'approved') approved += 1;
          else if (app.applicationStatus === 'rejected') rejected += 1;
        }

        document.getElementById('totalApps').innerText = total;
        document.getElementById('totalApproved').innerText = approved;
        document.getElementById('totalRejected').innerText = rejected;
      } else {
        alert("No applications found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching stats:", error);
      alert("Failed to load stats.");
    });
}
// --- DOM Elements ---
const scheduleRoutesBtn = document.getElementById("scheduleRoutesBtn");
const popupModal = document.getElementById("popupModal");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const cancelBtn = document.getElementById("cancelBtn");

// --- Show Popup Modal ---
scheduleRoutesBtn.addEventListener("click", () => {
  popupModal.classList.remove("hidden");
});

// --- Hide Popup Modal ---
cancelBtn.addEventListener("click", () => {
  popupModal.classList.add("hidden");
  fileInput.value = "";
});

// --- Upload File to Firebase ---
uploadBtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file first!");

  const filePath = `schedules/${Date.now()}_${file.name}`;
  const fileRef = storageRef(storage, filePath);

  uploadBytes(fileRef, file)
    .then(snapshot => getDownloadURL(snapshot.ref))
    .then(downloadURL => {
      const scheduleEntry = {
        name: file.name,
        url: downloadURL,
        timestamp: new Date().toISOString()
      };

      const entryRef = push(dbRef(database, "schedules"));
      return set(entryRef, scheduleEntry);
    })
    .then(() => {
      alert("File uploaded and saved to schedule!");
      popupModal.classList.add("hidden");
      fileInput.value = "";
    })
    .catch(err => {
      alert("Error uploading file: " + err.message);
    });
});
