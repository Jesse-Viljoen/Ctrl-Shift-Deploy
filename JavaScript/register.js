

// Firebase config
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

// Initialize Firebase
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const auth = firebase.auth();

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const storage = getStorage(app);
const database = getDatabase(app);

// Setup camera
async function setupCamera() {
  const video = document.getElementById("video");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    return new Promise((resolve) => {
      video.onloadedmetadata = () => resolve(video);
    });
  } catch (err) {
    console.error("Camera access denied:", err);
    alert("Camera access is required to register.");
  }
}
setupCamera();

// Take Selfie button logic
const takeSelfieBtn = document.getElementById("takeSelfieBtn");

takeSelfieBtn.addEventListener("click", () => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageDataUrl = canvas.toDataURL("image/png");

  // Preview selfie
  const selfiePreview = document.createElement("img");
  selfiePreview.src = imageDataUrl;
  selfiePreview.style.maxWidth = "200px";
  document.body.appendChild(selfiePreview);

  window.capturedSelfie = imageDataUrl;

  alert("Selfie taken! Now you can proceed with registration.");
});

// Register user
window.registerUser = async function () {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone")?.value.trim() || "";
  const username = document.getElementById("username")?.value.trim() || "";
  const password = document.getElementById("password").value.trim();
  const repassword = document.getElementById("repassword").value.trim();

  if (!name || !email || !password || !repassword || !username) {
    alert("Please fill in all required fields.");
    return;
  }

  if (password !== repassword) {
    alert("Passwords do not match!");
    return;
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    alert("Password must be at least 8 characters long, include a number and an uppercase letter.");
    return;
  }

  const imageDataUrl = window.capturedSelfie;

  if (!imageDataUrl) {
    alert("Please take a selfie before registering.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      phone,
      username,
      role: "student",
      createdAt: new Date(),
      uid: user.uid
    });

    // Optional: Save again with different role
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      phone,
      username,
      role: "parent",
      createdAt: new Date(),
      uid: user.uid
    });

    // Upload selfie
    const fileName = `${username}_selfie.png`;
    const imageRef = storageRef(storage, `user_images/${fileName}`);
    await uploadString(imageRef, imageDataUrl, 'data_url');
    const imageURL = await getDownloadURL(imageRef);

    // Save selfie URL in Realtime DB
    await dbSet(dbRef(database, `users/${username}`), {
      username,
      selfieURL: imageURL
    });

    alert("Registration successful! Redirecting...");
    window.location.href = "resource.html";
  } catch (error) {
    console.error("Registration error:", error);
    alert("Error: " + error.message);
  }
};

// Redirect to login
window.navigateToLogin = function () {
  window.location.href = "login.html";
};



 
   

 
