// Import Firebase and face-api
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { getAuth, sendEmailVerification } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com",
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Dynamically load face_main_api.js
const script = document.createElement('script');
script.src = 'path/to/face_main_api.js'; // Replace with the correct path
script.type = 'text/javascript';
document.head.appendChild(script);

// Set up verification method choice
const verifyButton = document.getElementById('verifyBtn');
verifyButton.addEventListener('click', async () => {
  const method = document.getElementById('verificationMethod').value;

  if (method === 'email') {
    const email = prompt("Please enter your email for verification:");
    if (!email || !email.includes('@')) {
      alert("Invalid email.");
      return;
    }

    const user = auth.currentUser;
    if (user && user.email === email) {
      sendEmailVerification(user)
        .then(() => {
          alert("Verification email sent. Please check your inbox.");
        })
        .catch((error) => {
          console.error("Email verification error:", error);
          alert("Error sending verification email.");
        });
    } else {
      alert("User not authenticated or email mismatch.");
    }
  } else if (method === 'face') {
    start(); // Start camera and facial recognition
  }
});

// Camera setup
async function setupCamera() {
  const video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

// Load face-api models
async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
  ]);
}

async function start() {
  await loadModels();
  const video = await setupCamera();
  video.play();
}

// On capture click
const captureBtn = document.getElementById('capture');
captureBtn.addEventListener('click', async () => {
  const video = document.getElementById('video');
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceExpressions();

  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  faceapi.matchDimensions(canvas, { width, height });

  const resizedDetections = faceapi.resizeResults(detections, { width, height });
  faceapi.draw.drawDetections(canvas, resizedDetections);
  faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

  if (detections.length > 0) {
    const imageDataUrl = canvas.toDataURL();
    verifyFace(detections, imageDataUrl);
  }
});

// Facial verification
async function verifyFace(detections, capturedImageDataUrl) {
  const userImagesRef = ref(storage, 'user_images/');
  const result = await listAll(userImagesRef);

  const urls = await Promise.all(result.items.map(item => getDownloadURL(item)));

  const descriptors = [];
  for (const url of urls) {
    const img = await faceapi.fetchImage(url);
    const description = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (description) descriptors.push(description.descriptor);
  }

  const capturedImage = await faceapi.fetchImage(capturedImageDataUrl);
  const capturedDescriptor = await faceapi.detectSingleFace(capturedImage).withFaceLandmarks().withFaceDescriptor();

  const distances = descriptors.map(d => faceapi.euclideanDistance(capturedDescriptor.descriptor, d));

  if (distances.some(d => d < 0.6)) {
    window.location.href = 'menu.html';
  } else {
    alert("No match found.");
  }
}
