// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Function to capture video
async function setupCamera() {
    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
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

// Start video feed and load models
async function start() {
    await loadModels();
    const video = await setupCamera();
    video.play();
}

start();

document.getElementById('capture').addEventListener('click', async () => {
    const video = document.getElementById('video');

    // Take a selfie
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.matchDimensions(canvas, { width: video.width, height: video.height });
    const resizedDetections = faceapi.resizeResults(detections, { width: video.width, height: video.height });
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    
    if (detections.length > 0) {
        // Get captured image data
        const imageDataUrl = canvas.toDataURL();

        // Call function to verify with database images
        verifyFace(detections, imageDataUrl);
    }
});

// Verification function
async function verifyFace(detections, capturedImageDataUrl) {
    const userImagesRef = firebase.storage().ref('user_images/'); // Adjust to your path
    const storedImages = []; // Array to hold promises fetching images

    // Fetch all images from Firebase Storage
    userImagesRef.listAll().then((result) => {
        result.items.forEach((imageRef) => {
            storedImages.push(imageRef.getDownloadURL()); // Push promises to array
        });

        // Wait until all images are fetched
        Promise.all(storedImages).then(async (urls) => {
            const descriptors = []; // Array to hold face descriptors
            for (const url of urls) {
                const img = await faceapi.fetchImage(url);
                const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                if (fullFaceDescription) {
                    descriptors.push(fullFaceDescription.descriptor);
                }
            }

            // Compare captured image with stored images
            const capturedImage = await faceapi.fetchImage(capturedImageDataUrl);
            const capturedDescriptor = await faceapi.detectSingleFace(capturedImage).withFaceLandmarks().withFaceDescriptor();

            const results = descriptors.map(descriptor => faceapi.euclideanDistance(capturedDescriptor.descriptor, descriptor));

            // Check if any distance is below a threshold (like 0.6)
            if (results.some(result => result < 0.6)) {
                // If match found
                window.location.href = 'menu.html'; // Redirect to menu page
            } else {
                alert("No match found.");
            }
        });
    });
}
