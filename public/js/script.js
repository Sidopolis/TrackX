const socket = io();
const introContainer = document.querySelector('.intro-container');
const mapContainer = document.getElementById('map');
const startButton = document.querySelector('.start-button');

// Initialize map but don't show it yet
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap"
}).addTo(map);

const markers = {};

const userIcon = L.icon({
    iconUrl: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png",
    iconSize: [38, 38],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
});

startButton.addEventListener('click', async () => {
    if (navigator.geolocation) {
        // Fade out intro container
        introContainer.style.opacity = '0';
        introContainer.style.transition = 'opacity 0.5s ease';
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        introContainer.style.display = 'none';
        mapContainer.style.display = 'block';
        mapContainer.style.opacity = '0';
        
        // Fade in map container
        setTimeout(() => {
            mapContainer.style.opacity = '1';
            mapContainer.style.transition = 'opacity 0.5s ease';
            map.invalidateSize();
        }, 100);

        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socket.emit("sendLocation", { latitude, longitude });
            },
            (error) => {
                console.log(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
    }
});

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
         if(markers[id]) {
             map.removeLayer(markers[id]);
             delete markers[id];
         }
});
