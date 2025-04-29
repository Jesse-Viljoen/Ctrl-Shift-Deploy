// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com",
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Pickup logic using if-else or switch
function getPickupMessage(time) {
  switch (time) {
    case "7:00": return "Early pickup";
    case "7:30": return "Normal pickup";
    case "8:00": return "Late pickup";
    default: return "Unknown time";
  }
}

function getReturnMessage(time) {
  if (time === "2:00") return "Early return";
  else if (time === "3:00") return "Standard return";
  else if (time === "4:00") return "Late return";
  else return "Unknown time";
}

// Form handler
document.getElementById("transportForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const parentName = document.getElementById("parentName").value;
  const childName = document.getElementById("childName").value;
  const role = document.getElementById("role").value;
  const destination = document.getElementById("destination").value;
  const locationLink = document.getElementById("locationLink").value;
  const pickupTime = document.getElementById("pickupTime").value;
  const returnTime = document.getElementById("returnTime").value;
  const subscription = document.getElementById("subscription").value;

  const pickupMessage = getPickupMessage(pickupTime);
  const returnMessage = getReturnMessage(returnTime);

  const data = {
    parentName,
    childName,
    role,
    destination,
    locationLink,
    pickupTime,
    pickupMessage,
    returnTime,
    returnMessage
  };

  database.ref("subscriptions/" + subscription).set(data)
    .then(() => {
      alert("Registration successful!");
      document.getElementById("transportForm").reset();
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});
