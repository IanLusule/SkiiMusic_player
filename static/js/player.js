// static/js/player.js

let songs = [];
let currentSongIndex = 0;
let isShuffle = false;
let repeatMode = 'NONE';  // Options: 'NONE', 'ONE', 'ALL'

const audioPlayer = document.getElementById("audio-player");
const playlistElement = document.getElementById("playlist");

// Fetch the playlist
async function loadSongs() {
    const response = await fetch('/api/songs');
    songs = await response.json();
    updatePlaylist();
}

// Display songs in the playlist
function updatePlaylist() {
    playlistElement.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.style.backgroundColor = (index === currentSongIndex) ? '#555' : '#444'; // Highlight current song
        
        // Apply marquee effect only to the current song
        const songText = document.createElement('span');
        songText.textContent = song;
        
        if (index === currentSongIndex) {
            songText.classList.add('marquee'); // Add marquee class to the current song
        }
        
        li.appendChild(songText);

        // Delete button
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'x';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteSong(song);
        };

        li.appendChild(deleteBtn);

        // Add click event to play the song
        li.onclick = () => {
            playSong(index);
        };

        playlistElement.appendChild(li);
    });
}

async function uploadSongs() {
    const files = document.getElementById('file').files;
    const formData = new FormData();

    for (const file of files) {
        formData.append('files[]', file);
    }

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            showNotification("Songs uploaded successfully!");
            loadSongs();  // Reload the playlist
        } else {
            showNotification("Upload failed. Please try again.");
        }
    } catch (error) {
        showNotification("Error uploading songs: " + error.message);
    }
}

async function deleteSong(song) {
    try {
        const response = await fetch('/api/delete_song', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song })
        });
        const data = await response.json();
        if (data.success) {
            showNotification("Song deleted successfully!");
            loadSongs();  // Reload the playlist
        } else {
            showNotification("Failed to delete the song.");
        }
    } catch (error) {
        showNotification("Error deleting song: " + error.message);
    }
}

// Show notification function
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.opacity = '1'; // Make it visible

    // Automatically hide the notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0'; // Fade out
        setTimeout(() => {
            notification.style.display = 'none'; // Hide completely
        }, 500); // Wait for fade out to finish before hiding
    }, 3000); // 3 seconds
}

// Array of GIF names
const gifAnimations = [
    // Add your GIF filenames here
    'walking-animation1.gif',
    'walking-animation10.gif',
    'walking-animation11.gif',
    'walking-animation12.gif',
    'walking-animation13.gif',
    'walking-animation14.gif',
    'walking-animation15.gif',
    'walking-animation16.gif',
    'walking-animation17.gif',
    'walking-animation18.gif',
    'walking-animation19.gif',
    'walking-animation2.gif',
    'walking-animation20.gif',
    'walking-animation21.gif',
    'walking-animation22.gif',
    'walking-animation23.gif',
    'walking-animation24.gif',
    'walking-animation25.gif',
    'walking-animation26.gif',
    'walking-animation27.gif',
    'walking-animation28.gif',
    'walking-animation29.gif',
    'walking-animation3.gif',
    'walking-animation30.gif',
    'walking-animation4.gif',
    'walking-animation5.gif',
    'walking-animation6.gif',
    'walking-animation7.gif',
    'walking-animation8.gif',
    'walking-animation9.gif'

    // Add more GIFs as needed
];

// Play a song by index
async function playSong(index) {
    currentSongIndex = index;
    audioPlayer.src = `/static/audio/${songs[currentSongIndex]}`;
    audioPlayer.play();

    const albumArt = document.getElementById("album-art");
    const albumArtSrc = `/static/images/${songs[currentSongIndex].replace('.mp3', '.jpg')}`; // Adjust as needed

    // Check if the album art file exists
    try {
        const response = await fetch(albumArtSrc);
        if (response.ok) {
            // If the album art exists, set its source
            albumArt.src = albumArtSrc;
            albumArt.style.display = 'block';
            albumArt.style.margin = '0 auto'; // Center horizontally
            albumArt.style.position = 'relative'; // Optional: adjust as necessary
            albumArt.style.maxWidth = '300px'; // Limit the maximum width
        } else {
            // If the album art does not exist, randomly select a GIF
            const randomGif = gifAnimations[Math.floor(Math.random() * gifAnimations.length)];
            albumArt.src = `/static/images/${randomGif}`; // Set to randomly selected GIF
            albumArt.style.display = 'block';
            albumArt.style.margin = '0 auto'; // Center horizontally
            albumArt.style.position = 'relative'; // Optional: adjust as necessary
            albumArt.style.maxWidth = '300px'; // Limit the maximum width
        }
    } catch (error) {
        // In case of a network error, display a random GIF
        console.error("Error fetching album art:", error);
        const randomGif = gifAnimations[Math.floor(Math.random() * gifAnimations.length)];
        albumArt.src = `/static/images/${randomGif}`; // Set to randomly selected GIF
        albumArt.style.display = 'block';
        albumArt.style.margin = '0 auto'; // Center horizontally
        albumArt.style.position = 'relative'; // Optional: adjust as necessary
        albumArt.style.maxWidth = '300px'; // Limit the maximum width
    }

    // Update the playlist and highlight the current song
    updatePlaylist();
}

function typeEffect(element, text, delay) {
    let index = 0;
    const interval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, delay);
}

window.onload = () => {
    const playlistTitle = document.querySelector('.sidebar h2');
    typeEffect(playlistTitle, "Playlist", 150); // Adjust the delay as needed
};

// Play/Pause toggle
function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
}

// Play the next song
function nextSong() {
    if (isShuffle) {
        currentSongIndex = Math.floor(Math.random() * songs.length);
    } else if (repeatMode === 'ONE') {
        // Do nothing, play the same song again
    } else {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
    }
    playSong(currentSongIndex);
}

// Play the previous song
function previousSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
}

// Toggle shuffle mode
function toggleShuffle() {
    isShuffle = !isShuffle;
    showNotification(`Shuffle is now: ${isShuffle ? 'ON' : 'OFF'}`);
}

// Toggle repeat mode
function toggleRepeat() {
    const repeatButton = document.getElementById("repeat-button");
    if (repeatMode === 'NONE') {
        repeatMode = 'ONE';
        repeatButton.innerHTML = '🔂'; // Repeat ONE symbol
    } else if (repeatMode === 'ONE') {
        repeatMode = 'ALL';
        repeatButton.innerHTML = '🔁'; // Repeat ALL symbol
    } else {
        repeatMode = 'NONE';
        repeatButton.innerHTML = '🔄'; // No repeat symbol
    }
    showNotification(`Repeat Mode: ${repeatMode}`);
}

// Automatically play next song when current ends
audioPlayer.onended = () => {
    if (repeatMode === 'ONE') {
        playSong(currentSongIndex);
    } else if (repeatMode === 'ALL' || currentSongIndex < songs.length - 1) {
        nextSong();
    }
};

// Function to toggle between light and dark mode
function toggleTheme() {
    const body = document.body;
    const themeButton = document.getElementById('theme-toggle-btn');

    // Toggle light mode class on the body
    body.classList.toggle('light-mode');

    // Update the button's icon based on the theme
    if (body.classList.contains('light-mode')) {
        themeButton.innerHTML = '🌒';  // Moon icon for dark mode
    } else {
        themeButton.innerHTML = '🌞';  // Sun icon for light mode
    }

    // Save the current theme to localStorage
    localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
}

// Initialize theme based on the current state
window.onload = () => {
    const body = document.body;
    const themeButton = document.getElementById('theme-toggle-btn');

    // Check if light mode is saved in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeButton.innerHTML = '🌒';  // Moon icon for dark mode
    } else {
        body.classList.remove('light-mode');
        themeButton.innerHTML = '🌞';  // Sun icon for light mode
    }

    const playlistTitle = document.querySelector('.sidebar h2');
    typeEffect(playlistTitle, "Playlist", 150); // Adjust the delay as needed
};

// Initialize player
loadSongs();
