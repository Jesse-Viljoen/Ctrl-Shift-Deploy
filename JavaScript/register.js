// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Firebase configuration
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
const db = getFirestore(app);
const auth = getAuth(app);
const storage = firebase.storage();
const database = firebase.database();



// Sign-up function
async function signUpUser(full_name, email,phone, password) {
    try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            full_name: full_name,
            email: email,
            phone: phone
            uid: user.uid
        });
        console.log("User registered successfully:", user);
    } catch (error) {
        console.error("Sign-up error:", error.message);
    }
}

// Login function
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Server error during login' }); // More descriptive error
    }
};


app.use('/api/auth', router); // Mount the router at the '/api/auth' path


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Function to setup camera
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

// Start video feed
async function start() {
    await setupCamera();
}

// Capture selfie and upload to Firebase
document.getElementById('capture').addEventListener('click', async () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // Get image data URL
    const imageDataUrl = canvas.toDataURL('image/png');
  
    const username = document.getElementById('username').value;
    if (username) {
        // Upload image to Firebase Storage
        const fileName = `${username}_selfie.png`; // Define the storage path
        const imageRef = storage.ref('user_images/' + fileName); // Adjust path as needed
        await imageRef.putString(imageDataUrl, 'data_url');

        // Optionally, save a reference to the user in the database with the URL of the image
        const imageURL = await imageRef.getDownloadURL();

        // Save user information along with image URL to the database
        database.ref('users/' + username).set({
            username: username,
            selfieURL: imageURL
        });

        alert('Registration successful! Your selfie has been uploaded.');
        // Optionally redirect to another page
        // window.location.href = 'menu.html'; // Redirect to menu
    } else {
        alert('Please enter a username.');
    }
});

// Call the start function to begin the video feed
start();


