// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY",
  authDomain: "ctrl-shift-deploy.firebaseapp.com",
  databaseURL: "https://ctrl-shift-deploy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ctrl-shift-deploy",
  storageBucket: "ctrl-shift-deploy.appspot.com", // ✅ Fixed a typo here
  messagingSenderId: "1008311150868",
  appId: "1:1008311150868:web:5d8db4655fbe8de360ba01",
  measurementId: "G-HXZWM4BW31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// javascript for location button 
const modal = document.createElement("div");
modal.id = "mapModal";
modal.style.cssText = `
  display: none;
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.6);
  justify-content: center;
  align-items: center;
`;

const modalContent = document.createElement("div");
modalContent.style.cssText = `
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 700px;
  position: relative;
`;

const closeBtn = document.createElement("span");
closeBtn.innerHTML = "&times;";
closeBtn.style.cssText = `
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 28px;
  cursor: pointer;
`;

const iframe = document.createElement("iframe");
iframe.width = "100%";
iframe.height = "400";
iframe.style.border = "0";
iframe.allowFullscreen = true;
iframe.loading = "lazy";
iframe.src = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=Googleplex,Mountain+View,CA`;

// Build structure
modalContent.appendChild(closeBtn);
modalContent.appendChild(iframe);
modal.appendChild(modalContent);
document.body.appendChild(modal);

// Open map button
const mapBtn = document.createElement("button");
mapBtn.textContent = "Open Map";
mapBtn.style.cssText = "padding: 10px 20px; margin-top: 20px;";
document.body.appendChild(mapBtn);

// Show modal on button click
mapBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Close modal on close button click
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Optional: close when clicking outside modal content
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});


// javascript for destination button 
modalContent.appendChild(closeBtn);
modalContent.appendChild(input);
modalContent.appendChild(searchBtn);
modalContent.appendChild(document.createElement("br"));
modalContent.appendChild(iframe);
modal.appendChild(modalContent);
document.body.appendChild(modal);

// Open modal
document.getElementById("openMapBtn").addEventListener("click", () => {
  modal.style.display = "flex";
});

// Close modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});



