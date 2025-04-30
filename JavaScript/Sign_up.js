
// Your web app's Firebase configuration
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
  firebase.initializeApp(firebaseConfig);
    const analytics = firebase.analytics();
    const auth = firebase.auth();
    const database = firebase.database();
  
// Handle form submission
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
  
    const userId = email.replace(/[.@]/g, "_");  // Safe key for Firebase path
  
    set(ref(db, 'users/' + userId), {
      name: name,
      surname: surname,
      email: email,
      password: password  // ⚠️ Insecure – don't do this in production!
    }).then(() => {
      alert("Sign-up successful!");
    }).catch((error) => {
      alert("Error: " + error.message);
    });
  });