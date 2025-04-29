
// Firebase config
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

// Firebase database initialization
firebase.initializeApp(firebaseConfig);
    const analytics = firebase.analytics();
    const auth = firebase.auth();
    const database = firebase.database();

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
const routeNameInput = document.getElementById("routeName");
const scheduleDateInput = document.getElementById("scheduleDate");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

// --- Show Popup Modal ---
scheduleRoutesBtn.addEventListener("click", () => {
  popupModal.classList.remove("hidden");
});

// --- Hide Popup Modal ---
cancelBtn.addEventListener("click", () => {
  popupModal.classList.add("hidden");
  fileInput.value = "";
  routeNameInput.value = "";
  scheduleDateInput.value = "";
});

// --- Upload File to Firebase with Route Metadata ---
uploadBtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  const routeName = routeNameInput.value.trim();
  const scheduleDate = scheduleDateInput.value.trim();

  if (!file || !routeName || !scheduleDate) {
    return alert("Please provide file, route name, and schedule date.");
  }

  const filePath = `schedules/${Date.now()}_${file.name}`;
  const fileRef = storageRef(storage, filePath);

  uploadBytes(fileRef, file)
    .then(snapshot => getDownloadURL(snapshot.ref))
    .then(downloadURL => {
      const scheduleEntry = {
        name: file.name,
        routeName,
        scheduleDate,
        url: downloadURL,
        timestamp: new Date().toISOString()
      };

      const entryRef = push(ref(database, "schedules"));
      return set(entryRef, scheduleEntry);
    })
    .then(() => {
      alert("Schedule uploaded successfully!");
      popupModal.classList.add("hidden");
      fileInput.value = "";
      routeNameInput.value = "";
      scheduleDateInput.value = "";
    })
    .catch(err => {
      console.error("Upload error:", err);
      alert("Error uploading file: " + err.message);
    });
});

// --- Search Schedules ---
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) {
    return alert("Please enter a route name to search.");
  }
  searchSchedules(query);
});

function searchSchedules(routeQuery) {
  const schedulesRef = ref(database, "schedules");

  get(schedulesRef)
    .then(snapshot => {
      if (snapshot.exists()) {
        const schedules = snapshot.val();
        const results = [];

        for (const key in schedules) {
          const entry = schedules[key];
          if (entry.routeName.toLowerCase().includes(routeQuery.toLowerCase())) {
            results.push(entry);
          }
        }

        displaySearchResults(results);
      } else {
        alert("No schedules found.");
      }
    })
    .catch(error => {
      console.error("Search error:", error);
      alert("Failed to search schedules.");
    });
}

function displaySearchResults(results) {
  searchResults.innerHTML = "";

  if (results.length === 0) {
    searchResults.innerText = "No matching schedules found.";
    return;
  }

  results.forEach(entry => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>Route:</strong> ${entry.routeName}</p>
      <p><strong>Date:</strong> ${entry.scheduleDate}</p>
      <a href="${entry.url}" target="_blank">Download Schedule</a>
      <hr />
    `;
    searchResults.appendChild(div);
  });
}
