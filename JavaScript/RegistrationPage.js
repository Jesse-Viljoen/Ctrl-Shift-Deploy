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
  const db = firebase.database();
  
  // Form submission handling
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault(); // prevent page reload
  
    // Collect form values
    const fullName = document.getElementById("fullName").value.trim();
    const role = document.getElementById("role").value;
    const contact = document.getElementById("contact").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const dropoff = document.getElementById("dropoff").value.trim();
    const pickupTime = document.getElementById("pickupTime").value;
    const returnTime = document.getElementById("returnTime").value;
  
    // Create a safe unique ID based on email (or you can use push())
    const userId = email.replace(/[.@]/g, "_");
  
    // Save to Firebase under /transportRegistrations/
    firebase.database().ref("transportRegistrations/" + userId).set({
      fullName,
      role,
      contact,
      email,
      address,
      dropoff,
      pickupTime,
      returnTime,
      timestamp: new Date().toISOString()
    })
    .then(() => {
      alert("Registration submitted successfully!");
      document.querySelector("form").reset();
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
  });
