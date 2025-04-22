// Import necessary Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set } from "firebase/database";

// Your Firebase web app's configuration
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
const db = getDatabase(app);  // Firebase Realtime Database

// Video element for face recognition
const video = document.getElementById("video");
const isScreenSmall = window.matchMedia("(max-width: 700px)");

// Load FaceAPI models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models")
]).then(startVideo);

// Start video stream
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error("Error accessing video stream: ", err));
}

// Detect faces and save data to Firebase
async function detectAndSaveFace() {
  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

  if (detections.length > 0) {
    // For example, save the first detected face descriptor (you could also use other data from detections)
    const faceDescriptor = detections[0].descriptor;

    // Save face descriptor and other data to Firebase
    const userId = "user123";  // You can replace this with actual user data
    const userFaceDataRef = ref(db, 'faces/' + userId);  // Referring to a path like /faces/user123 in the database

    set(userFaceDataRef, {
      faceDescriptor: faceDescriptor,  // Store the face descriptor (you can store more details as needed)
      timestamp: new Date().toISOString()  // Optionally, save the timestamp
    }).then(() => {
      console.log("Face data saved to Firebase");
    }).catch(error => {
      console.error("Error saving face data: ", error);
    });
  }
}

// Run face detection every few seconds
setInterval(detectAndSaveFace, 5000);  // Detect every 5 seconds (adjust as needed)

// Resize video based on screen size
function screenResize(isScreenSmall) {
  if (isScreenSmall.matches) {
    video.style.width = "320px";  // Small screen size
  } else {
    video.style.width = "500px";  // Larger screen size
  }
}

// Event listener to adjust video size on screen resize
isScreenSmall.addEventListener("change", function() {
  screenResize(isScreenSmall);
});

// Initial video size adjustment on page load
screenResize(isScreenSmall);
