from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime, timedelta
import jwt
import functools

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'b737f165bb1fa6e945b79953774d7fbf190e94984c9861830a66056b2912ad54'

UPLOAD_FOLDER = 'static/uploads'
DATABASE = 'simomp3.db'
JWT_SECRET = 'f4f412a020ae38e66e93fabc301a32cf157ce3c37234b40d777b8570bc7b466c' 

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Tabella per associare file agli utenti
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            filename TEXT NOT NULL,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Decorator per routes protette
def login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token mancante'}), 401
        
        try:
            # Rimuovi "Bearer " se presente
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user_id = data['user_id']
            
            # Verifica che l'utente esista ancora
            conn = sqlite3.connect(DATABASE)
            cursor = conn.cursor()
            cursor.execute('SELECT id, username FROM users WHERE id = ? AND is_active = 1', (current_user_id,))
            user = cursor.fetchone()
            conn.close()
            
            if not user:
                return jsonify({'error': 'Utente non valido'}), 401
                
            request.current_user = {'id': user[0], 'username': user[1]}
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token scaduto'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token non valido'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

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
@app.route('/files')
@login_required
def list_files():
    user_id = request.current_user['id']
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT filename FROM user_files WHERE user_id = ? ORDER BY upload_date DESC', (user_id,))
    files = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(files)

@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
    user_id = request.current_user['id']
    file = request.files['file']
    
    if file and file.filename.endswith('.mp3'):
        # Crea un nome file unico per evitare conflitti
        filename = f"{user_id}_{file.filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Salva nel database
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('INSERT INTO user_files (user_id, filename) VALUES (?, ?)', (user_id, filename))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'File caricato con successo'}), 201
    
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

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)