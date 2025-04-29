

const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com",
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);
    const analytics = firebase.analytics();
    const auth = firebase.auth();
    const database = firebase.database();

// Load external face-api.js
const script = document.createElement('script');
script.src = 'Ctrl-Shift-Deploy/JavaScript/face_main_api.js';
document.head.appendChild(script);

// Email or Face Verification
document.getElementById('verifyBtn').addEventListener('click', async () => {
  const method = document.getElementById('verificationMethod').value;
  if (method === 'email') {
    await emailVerificationFlow();
  } else if (method === 'face') {
    await start();
  }
});

async function emailVerificationFlow() {
  const email = prompt("Please enter your email:");
  if (!email.includes('@')) return alert("Invalid email.");

  const user = auth.currentUser;
  if (!user || user.email !== email) return alert("User not authenticated or email mismatch.");

  try {
    await sendEmailVerification(user);
    alert("Verification email sent.");
  } catch (err) {
    console.error(err);
    alert("Failed to send verification.");
  }
}

// Set up camera and models
async function setupCamera() {
  const video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

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

// Capture and Verify Face
document.getElementById('capture').addEventListener('click', async () => {
  const video = document.getElementById('video');
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks().withFaceExpressions();

  const { videoWidth: width, videoHeight: height } = video;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  faceapi.matchDimensions(canvas, { width, height });

  const resizedDetections = faceapi.resizeResults(detections, { width, height });
  faceapi.draw.drawDetections(canvas, resizedDetections);

  if (detections.length > 0) {
    const imageDataUrl = canvas.toDataURL();
    await verifyFace(imageDataUrl);
  }
});

// Verify face and match with email
async function verifyFace(capturedImageDataUrl) {
  const groups = ['parent1', 'parent2', 'student1', 'student2']; // here is where the array match would try to match with faceUrl / faceImageUrl variable with the email
  const faceUrls = [];
  const emailList = [];

  // Step 1: Collect all emails
  for (const group of groups) {
    const emailRef = dbRef(database, `email/${group}/users`);
    const emailSnap = await get(emailRef);
    if (emailSnap.exists()) {
      Object.values(emailSnap.val()).forEach(entry => {
        if (entry.email) emailList.push(entry.email);
      });
    }
  }

  // Step 2: Match current user’s email
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    alert("You must be logged in.");
    return;
  }

  if (!emailList.includes(currentUser.email)) {
    alert("Your email is not registered.");
    return;
  }

  // Step 3: Fetch all facial image URLs
  for (const group of groups) {
    const faceRef = ref(storage, `faceImageUrl/securityVerification/${group}/users`);
    try {
      const list = await listAll(faceRef);
      const urls = await Promise.all(list.items.map(item => getDownloadURL(item)));
      faceUrls.push(...urls);
    } catch (err) {
      console.warn(`No images found for ${group}:`, err.message);
    }
  }

  // Step 4: Generate descriptors
  const labeledDescriptors = [];
  for (const url of faceUrls) {
    const img = await faceapi.fetchImage(url);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (detection) labeledDescriptors.push(detection.descriptor);
  }

  // Step 5: Match captured face
  const capturedImage = await faceapi.fetchImage(capturedImageDataUrl);
  const capturedDesc = await faceapi.detectSingleFace(capturedImage).withFaceLandmarks().withFaceDescriptor();

  if (!capturedDesc) {
    alert("Unable to process your face.");
    return;
  }

  const distances = labeledDescriptors.map(d => faceapi.euclideanDistance(capturedDesc.descriptor, d));
  const isMatched = distances.some(d => d < 0.6);

  if (isMatched) {
    alert("Face recognized!");
    window.location.href = 'User_Dashboard.html';
  } else {
    alert("No matching face found.");
  }
}
