

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

firebase.initializeApp(firebaseConfig);
    const analytics = firebase.analytics();
    const auth = firebase.auth();
    const database = firebase.database();


document.getElementById("driverForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const driverName = document.getElementById("driverName").value;
  const driverPhone = document.getElementById("driverPhone").value;
  const rating = document.getElementById("rating").value;
  const rideTypes = document.getElementById("rideTypes").value;
  const rideDetails = document.getElementById("rideDetails").value;
  const licenseNumber = document.getElementById("licenseNumber").value;

  const whatsappLink = `https://wa.me/${driverPhone}`;

  const newDriverRef = push(ref(database, "drivers"));

  set(newDriverRef, {
    driverName,
    driverPhone,
    rating,
    rideTypes,
    rideDetails,
    licenseNumber,
    whatsappLink
  })
    .then(() => {
      alert("Driver info saved!");
      document.getElementById("whatsappLink").href = whatsappLink;
      document.getElementById("driverForm").reset();
    })
    .catch((error) => {
      console.error("Error saving driver:", error);
    });
});

