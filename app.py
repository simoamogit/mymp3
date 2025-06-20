import json
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime, timedelta
import jwt
import functools
import re
import uuid
import yt_dlp
import mutagen
from mutagen.mp3 import MP3
from mutagen.id3 import ID3

app = Flask(__name__)
CORS(app, 
     resources={r"/*": {"origins": "http://localhost:3000"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
app.secret_key = 'b737f165bb1fa6e945b79953774d7fbf190e94984c9861830a66056b2912ad54'

UPLOAD_FOLDER = 'static/uploads'
DATABASE = 'simomp3.db'
JWT_SECRET = 'f4f412a020ae38e66e93fabc301a32cf157ce3c37234b40d777b8570bc7b466c' 

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def sanitize_filename(filename):
    filename = os.path.basename(filename)
    filename = re.sub(r'[^\w\s\-\.]', '', filename)
    filename = re.sub(r'\s+', '_', filename)
    return filename[:100] + '_' + str(uuid.uuid4())[:8] + '.mp3'

# Aggiungi questo gestore per le richieste OPTIONS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Aggiorna il decoratore login_required
def login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token mancante'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            user_id = data['user_id']
            
            conn = sqlite3.connect(DATABASE)
            cursor = conn.cursor()
            cursor.execute('SELECT id, username FROM users WHERE id = ? AND is_active = 1', (user_id,))
            user = cursor.fetchone()
            conn.close()
            
            if not user:
                return jsonify({'error': 'Utente non valido'}), 401
                
            request.current_user = {'id': user[0], 'username': user[1]}
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token scaduto'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Errore token: {str(e)}")
            return jsonify({'error': 'Token non valido'}), 401
        except Exception as e:
            print(f"Errore generico: {str(e)}")
            return jsonify({'error': 'Errore di autenticazione'}), 500
        
    return decorated_function

# Inizializza il database
def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Tabella utenti
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_active INTEGER DEFAULT 1
        )
    ''')
    
    # Tabella per associare file agli utenti - VERSIONE CORRETTA
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            filename TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Verifica che la colonna original_filename esista
    try:
        cursor.execute("SELECT original_filename FROM user_files LIMIT 1")
    except sqlite3.OperationalError:
        print("La colonna 'original_filename' non esiste, aggiungo...")
        cursor.execute('''
            ALTER TABLE user_files
            ADD COLUMN original_filename TEXT NOT NULL DEFAULT 'unknown'
        ''')
    
    conn.commit()
    conn.close()
    print("Database inizializzato con successo!")


# Routes per autenticazione
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email e password sono obbligatori'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'La password deve essere di almeno 6 caratteri'}), 400
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Verifica se username o email esistono già
    cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Username o email già in uso'}), 400
    
    # Crea nuovo utente
    password_hash = generate_password_hash(password)
    cursor.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                   (username, email, password_hash))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Registrazione completata con successo'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username e password sono obbligatori'}), 400
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT id, username, password_hash FROM users WHERE username = ? AND is_active = 1', (username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not check_password_hash(user[2], password):
        return jsonify({'error': 'Credenziali non valide'}), 401
    
    # Genera JWT token
    token = jwt.encode({
        'user_id': user[0],
        'username': user[1],
        'exp': datetime.utcnow() + timedelta(days=7)  # Token valido per 7 giorni
    }, JWT_SECRET, algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'id': user[0],
            'username': user[1]
        }
    })

@app.route('/profile', methods=['GET'])
@login_required
def get_profile():
    return jsonify({'user': request.current_user})

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    # Con JWT, il logout è gestito lato client eliminando il token
    return jsonify({'message': 'Logout effettuato'})

# Routes per i file (ora protette)
# app.py (modifica list_files)
@app.route('/files')
@login_required
def list_files():
    user_id = request.current_user['id']
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT filename, original_filename, upload_date 
        FROM user_files 
        WHERE user_id = ? 
        ORDER BY upload_date DESC
    ''', (user_id,))
    
    files = []
    for row in cursor.fetchall():
        files.append({
            'filename': row[0],
            'originalName': row[1],
            'uploadDate': row[2]
        })
    
    conn.close()
    return jsonify(files)

@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
    user_id = request.current_user['id']
    file = request.files.get('file')

    if file and file.filename.endswith('.mp3'):
        safe_filename = sanitize_filename(file.filename)
        filename = f"{user_id}_{safe_filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # CREA LA DIRECTORY SE NON ESISTE
        os.makedirs(os.path.dirname(filepath), exist_ok=True)  # <-- FIX
        
        file.save(filepath)

    try:
        audio = MP3(filepath, ID3=ID3)
        metadata = {
            'title': file.filename,
            'artist': 'Artista sconosciuto',
            'album': 'Album sconosciuto',
            'year': '',
            'genre': '',
            'duration': audio.info.length
        }
        
        # Mappatura tag ID3
        id3_tags = {
            'TIT2': 'title',
            'TPE1': 'artist',
            'TALB': 'album',
            'TYER': 'year',
            'TCON': 'genre'
        }
        
        for tag, value in audio.tags.items():
            tag_name = tag[0:4]
            if tag_name in id3_tags:
                metadata[id3_tags[tag_name]] = str(value[0])
                
        # Gestione copertina album
        if 'APIC:' in audio.tags:
            apic = audio.tags['APIC:'].data
            # Salva l'immagine e registra il percorso
            cover_path = os.path.join(app.config['UPLOAD_FOLDER'], f'cover_{filename}.jpg')
            with open(cover_path, 'wb') as f:
                f.write(apic)
            metadata['artwork'] = cover_path

    except Exception as e:
        print(f"Errore estrazione metadati: {str(e)}")
        metadata = {}
        metadata = {}
    
        # Salva nel database
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        # Salva nel database aggiungendo i metadati
        cursor.execute(
            'INSERT INTO user_files (user_id, filename, original_filename, metadata) VALUES (?, ?, ?, ?)',
            (user_id, filename, file.filename, json.dumps(metadata))
        )
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'File caricato con successo'}), 201

    # Se il file non è valido
    return jsonify({'error': 'File non valido'}), 400

@app.route('/uploads/<filename>')
@login_required
def uploaded_file(filename):
    user_id = request.current_user['id']
    
    # Verifica che il file appartenga all'utente
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT filename FROM user_files WHERE user_id = ? AND filename = ?', (user_id, filename))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'File non autorizzato'}), 403
    conn.close()
    
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/delete/<filename>', methods=['DELETE'])
@login_required
def delete_file(filename):
    user_id = request.current_user['id']
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Verifica che il file appartenga all'utente
    cursor.execute('SELECT id FROM user_files WHERE user_id = ? AND filename = ?', (user_id, filename))
    file_record = cursor.fetchone()
    
    if not file_record:
        conn.close()
        return jsonify({'error': 'File non trovato'}), 404
    
    # Elimina dal database
    cursor.execute('DELETE FROM user_files WHERE id = ?', (file_record[0],))
    conn.commit()
    conn.close()
    
    # Elimina il file fisico
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    
    return jsonify({'message': 'File eliminato con successo'})

@app.route('/delete-multiple', methods=['POST'])
@login_required
def delete_multiple_files():
    user_id = request.current_user['id']
    data = request.json
    filenames = data.get('filenames', [])
    delete_all = data.get('delete_all', False)

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    try:
        if delete_all:
            # Seleziona tutti i file dell'utente
            cursor.execute('SELECT filename FROM user_files WHERE user_id = ?', (user_id,))
            filenames = [row[0] for row in cursor.fetchall()]
        elif not filenames:
            return jsonify({'error': 'Nessun file selezionato'}), 400

        # Elimina i file selezionati
        deleted_count = 0
        for filename in filenames:
            cursor.execute('SELECT id FROM user_files WHERE user_id = ? AND filename = ?', (user_id, filename))
            file_record = cursor.fetchone()
            
            if file_record:
                # Elimina dal database
                cursor.execute('DELETE FROM user_files WHERE id = ?', (file_record[0],))
                # Elimina il file fisico
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                if os.path.exists(filepath):
                    os.remove(filepath)
                deleted_count += 1

        conn.commit()
        return jsonify({'message': f'Eliminati {deleted_count} file', 'deleted': deleted_count})
    
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/download-youtube-playlist', methods=['POST'])
@login_required
def download_youtube_playlist():
    user_id = request.current_user['id']
    data = request.json
    playlist_url = data.get('playlist_url')
    
    if not playlist_url:
        return jsonify({'error': 'URL playlist mancante'}), 400
    
    # Verifica che sia un URL di YouTube valido
    if not re.match(r'^(https?://)?(www\.)?(youtube\.com|youtu\.?be)/.*(list=|playlist)', playlist_url):
        return jsonify({'error': 'URL playlist YouTube non valido'}), 400

    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': os.path.join(app.config['UPLOAD_FOLDER'], f'{user_id}_%(title)s.%(ext)s'),
        'quiet': True,
        'ignoreerrors': True,
        'extract_flat': True,
    }

    try:
        downloaded_files = []
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(playlist_url, download=True)
            
            # Se è una playlist, otteniamo tutte le voci
            entries = info['entries'] if 'entries' in info else [info]
            
            for entry in entries:
                if not entry:
                    continue
                    
                # Ottieni il nome del file generato
                original_title = entry.get('title', 'unknown')
                filename = ydl.prepare_filename(entry).replace('.webm', '.mp3').replace('.m4a', '.mp3')
                
                # Salva nel database
                conn = sqlite3.connect(DATABASE)
                cursor = conn.cursor()
                cursor.execute(
                    'INSERT INTO user_files (user_id, filename, original_filename) VALUES (?, ?, ?)',
                    (user_id, os.path.basename(filename), original_title)
                )
                conn.commit()
                conn.close()
                downloaded_files.append(original_title)
        
        return jsonify({
            'message': f'Scaricati {len(downloaded_files)} brani',
            'downloaded': downloaded_files
        })
        
    except yt_dlp.utils.DownloadError as e:
        return jsonify({'error': f'Errore download: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Errore imprevisto: {str(e)}'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)