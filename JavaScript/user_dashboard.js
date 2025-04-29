

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
    const analytics = firebase.analytics();
    const auth = firebase.auth();
    const database = firebase.database();


// Detect current user
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    const userRef = ref(database, 'users/' + userId);

    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        document.getElementById("profile-photo").src = data.imageUrl || "default.jpg";
        document.getElementById("name").textContent = data.name;
        document.getElementById("surname").textContent = data.surname;
        document.getElementById("email").textContent = data.email;
        document.getElementById("phone").textContent = data.phone;
        document.getElementById("username").textContent = data.username;

        // Tracking
        document.getElementById("driver-distance").textContent = "Driver distance: " + (data.driverDistance || "unknown");

        // WhatsApp Link
        if (data.driverPhone) {
          const whatsappURL = `https://wa.me/${data.driverPhone}`;
          document.getElementById("whatsapp-link").href = whatsappURL;
        }
      }
    });
  }
});

// Delete account function
function deleteAccount() {
  const user = auth.currentUser;
  if (user) {
    const userRef = ref(database, 'users/' + user.uid);
    remove(userRef)
      .then(() => {
        return deleteUser(user);
      })
      .then(() => {
        alert("Account deleted successfully.");
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error("Error deleting account:", error);
      });
  }
}

// View/Update/Transport/Logout placeholders
function goToRegisterInfo() {
// Handle form submission
document.getElementById("userForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value;
  const childName = document.getElementById("childName").value;
  const subscription = document.getElementById("subscription").value;
  const pickupTime = document.getElementById("pickupTime").value;
  const location = document.getElementById("location").value;
  const destination = document.getElementById("destination").value;

  // Create a new user entry with a unique ID
  const newUserRef = push(ref(database, "users"));

  set(newUserRef, {
    name,
    role,
    childName,
    subscription,
    pickupTime,
    location,
    destination
  })
    .then(() => {
      alert("Data saved successfully!");
      document.getElementById("userForm").reset();
    })
    .catch((error) => {
      console.error("Error saving data:", error);
    });
});

}

function viewSubscription() {
  window.location.href = "ride_info.html";
}

function updateInformation() {
  window.location.href = "account_management.html";
}

function showTransportInfo() {
  window.location.href = "transport-info.html";
}

