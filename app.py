# app.py

from flask import Flask, render_template, request, redirect, url_for, jsonify
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'static/audio'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the audio folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Route to the main page
@app.route('/')
def index():
    return render_template('index.html')

# Route to upload songs
@app.route('/upload', methods=['POST'])
def upload_file():
    files = request.files.getlist('files[]')
    for file in files:
        if file and file.filename.endswith(('.mp3', '.wav')):
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
    return jsonify(success=True)

# API to get the list of songs
@app.route('/api/songs')
def get_songs():
    songs = os.listdir(app.config['UPLOAD_FOLDER'])
    return jsonify(songs)

# API to delete a song
@app.route('/api/delete_song', methods=['POST'])
def delete_song():
    song = request.json.get('song')
    song_path = os.path.join(app.config['UPLOAD_FOLDER'], song)
    if os.path.exists(song_path):
        os.remove(song_path)
        return jsonify(success=True)
    return jsonify(success=False)

if __name__ == '__main__':
    app.run(debug=False)
