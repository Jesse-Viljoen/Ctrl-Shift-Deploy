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

  async function loadUserProfile(userId) {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}/subscription`);
    
    try {
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();

            const faceimageUrl = data.faceimageUrl || 'https://via.placeholder.com/100';
            const name = data.name || "Unknown User";
            const rating = data.rating || "No rating available";
            const route = data.route || "Not specified";
            const distance = data.distance || "Unknown";
            const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(route)}`;

            document.getElementById("user-photo-card").innerHTML = `
                <img src="${faceimageUrl}" alt="Profile Photo" />
                <h3>${name}</h3>
                <p>Rating: ${rating}</p>
            `;

            document.getElementById("user-route-card").innerHTML = `
                <h3>Route: ${route}</h3>
                <p>Distance: ${distance}</p>
                <div class="map-container">
                    <iframe
                        src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCziePliT98EApfT9Rd3yjNzlCWc4zWaDA&q=${encodeURIComponent(route)}"
                        frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen>
                    </iframe>
                </div>
                <a href="${googleMapsLink}" target="_blank" class="google-maps-link">View on Google Maps</a>
            `;
        } else {
            document.getElementById("user-photo-card").innerHTML = "<p>No subscription data found.</p>";
            document.getElementById("user-route-card").innerHTML = "<p>No route information found.</p>";
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        document.getElementById("user-photo-card").innerHTML = "<p>Error loading data.</p>";
        document.getElementById("user-route-card").innerHTML = "<p>Error loading route data.</p>";
    }
}

// Example: Call with a specific userId when ready (e.g. on dropdown change)
document.getElementById("user-selector").addEventListener("change", function() {
    loadUserProfile(this.value);
});

// On page load, load the first user by default
window.onload = () => {
    loadUserProfile("parent1"); // or dynamically set a default user
    loadUserProfile("parent2");
    loadUserProfile("student1");
    loadUserProfile("student2");
};




