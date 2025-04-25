// Import necessary Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get } from "firebase/database";
import { getStorage, ref as storageRef, listAll, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);  // Firebase Storage

// Dynamically load face-api.min.js (loaded only once)
const script = document.createElement('script');
script.src = 'path/to/face-api.min.js'; // Path to face-api.min.js
script.type = 'text/javascript';
document.head.appendChild(script);

// Wait for DOM content to be loaded before accessing elements
window.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");

  if (!video) {
    console.error("Video element not found in DOM.");
    return;
  }

  const isScreenSmall = window.matchMedia("(max-width: 700px)");

  // Load FaceAPI models
  script.onload = () => {
    loadModels().then(startVideo).catch(err => console.error("Error loading FaceAPI models: ", err));
  };

  // Start video stream
  function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(err => console.error("Error accessing video stream: ", err));
  }

  // Load the models in face-api.js
  async function loadModels() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
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

  // Compare the captured face with known faces stored in Firebase
  async function verifyFace(capturedImageDataUrl) {
    const capturedImage = await faceapi.fetchImage(capturedImageDataUrl);
    const capturedDescriptor = await faceapi.detectSingleFace(capturedImage).withFaceLandmarks().withFaceDescriptor();
    
    const userImagesRef = storageRef(storage, 'user_images/');
    const result = await listAll(userImagesRef);
    const urls = await Promise.all(result.items.map(item => getDownloadURL(item)));

    const descriptors = [];
    for (const url of urls) {
      const img = await faceapi.fetchImage(url);
      const description = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      if (description) descriptors.push(description.descriptor);
    }

    const distances = descriptors.map(d => faceapi.euclideanDistance(capturedDescriptor.descriptor, d));
    
    if (distances.some(d => d < 0.6)) {
      window.location.href = 'User_Dashboard.html'; // Face match found, redirect to the User_Dashboard page
    } else {
      alert("No match found.");
    }
  }

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
