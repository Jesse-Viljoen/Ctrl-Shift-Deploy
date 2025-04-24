// Firebase imports
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
  import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getDatabase(app);

  // Realtime update for admin control subscription
  const updateSubscriptionField = (field, value) => {
    const updates = {};
    updates[`admincontrol/subscription/${field}`] = value;
    update(ref(db), updates);
  };

  const setupLiveSubscriptionListeners = () => {
    const fields = ['plan', 'status', 'startDate', 'endDate'];
    fields.forEach(field => {
      const input = document.getElementById(field);
      input.addEventListener('input', () => {
        updateSubscriptionField(field, input.value);
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    setupLiveSubscriptionListeners();

    // Setup map modal
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
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDoDiJ9-UzKfuwBLS3f4N-4V96vgE2hNEY&q=Googleplex,Mountain+View,CA`;

    // Build modal
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Open and close map modal
    const mapBtn = document.createElement("button");
    mapBtn.textContent = "Open Map";
    mapBtn.style.cssText = "padding: 10px 20px; margin-top: 20px;";
    document.body.appendChild(mapBtn);

    mapBtn.addEventListener("click", () => modal.style.display = "flex");
    closeBtn.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });

    // Subscribe button popup logic
    document.getElementById("subscribeBtn").addEventListener("click", () => {
      document.getElementById("popup").style.display = "block";
      document.getElementById("popup-overlay").style.display = "block";
    });

    window.closePopup = function () {
      document.getElementById("popup").style.display = "none";
      document.getElementById("popup-overlay").style.display = "none";
    };

    window.confirmSubscription = async function () {
      const selectedPlan = document.getElementById("planSelect").value;
      const path = "users/parent1/subscription";

      await set(ref(db, path), {
        plan: selectedPlan,
        status: "active",
        startDate: new Date().toISOString().split("T")[0]
      });

      alert(`Subscribed to ${selectedPlan} plan successfully!`);
      closePopup();
    };
  });

