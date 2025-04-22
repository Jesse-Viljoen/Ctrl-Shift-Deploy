// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, set as dbSet } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com", // Corrected storage bucket domain
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const database = getDatabase(app);

// Sign-up function
async function signUpUser(full_name, email, phone, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            full_name: full_name,
            email: email,
            phone: phone,
            uid: user.uid
        });

        console.log("User registered successfully:", user);
        alert("User registered successfully!");
    } catch (error) {
        console.error("Sign-up error:", error.message);
        alert("Sign-up failed: " + error.message);
    }
}

// Setup camera feed
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

// Start camera feed
async function start() {
    await setupCamera();
}

// Capture and upload selfie
document.getElementById('capture').addEventListener('click', async () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/png');

    const username = document.getElementById('username').value;
    if (username) {
        const fileName = `${username}_selfie.png`;
        const imageRef = ref(storage, `user_images/${fileName}`);
        await uploadString(imageRef, imageDataUrl, 'data_url');

        const imageURL = await getDownloadURL(imageRef);

        await dbSet(dbRef(database, `users/${username}`), {
            username: username,
            selfieURL: imageURL
        });

        alert('Registration successful! Your selfie has been uploaded.');
        // Optional redirect:
        // window.location.href = 'menu.html';
    } else {
        alert('Please enter a username.');
    }
});

// Kick off camera feed on page load
start();
