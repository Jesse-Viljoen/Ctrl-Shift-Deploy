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

// Wait for DOM content to be loaded before accessing elements
window.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");

  if (!video) {
    console.error("Video element not found in DOM.");
    return;
  }

  const isScreenSmall = window.matchMedia("(max-width: 700px)");

  // Load FaceAPI models
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models")
  ])
  .then(startVideo)
  .catch(err => console.error("Error loading FaceAPI models: ", err));

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
      const faceDescriptor = detections[0].descriptor;

      // Serialize descriptor to Array to ensure Firebase compatibility
      const userId = "user123";   // Replace with dynamic user ID in production
      const userFaceDataRef = ref(db, 'faces/' + userId);

      set(userFaceDataRef, {
        faceDescriptor: Array.from(faceDescriptor),
        timestamp: new Date().toISOString()
      }).then(() => {
        console.log("Face data saved to Firebase");
      }).catch(error => {
        console.error("Error saving face data: ", error);
      });
    }
  }

  // Run face detection every few seconds
  setInterval(detectAndSaveFace, 5000);  // Detect every 5 seconds

  // Resize video based on screen size
  function screenResize(isScreenSmall) {
    if (isScreenSmall.matches) {
      video.style.width = "320px";
    } else {
      video.style.width = "500px";
    }
  }

  // Adjust video size on screen resize
  isScreenSmall.addEventListener("change", function() {
    screenResize(isScreenSmall);
  });

  // Initial resize
  screenResize(isScreenSmall);
});

