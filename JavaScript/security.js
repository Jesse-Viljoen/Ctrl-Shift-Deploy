

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
firebase.analytics();
const auth = firebase.auth();

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const database = getDatabase(app);


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



  