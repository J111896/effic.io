from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'efficio_secret_key')

# Konfiguration für Login-Manager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Datenbankpfad
DB_PATH = os.environ.get('DATABASE_PATH', 'efficio.db')

# Benutzerklasse für Flask-Login
class User(UserMixin):
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

# Datenbankinitialisierung
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Benutzer-Tabelle
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    ''')
    
    # Berechnungen-Tabelle
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        data TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Datenbank initialisieren
init_db()

# User Loader für Flask-Login
@login_manager.user_loader
def load_user(user_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user_data = cursor.fetchone()
    conn.close()
    
    if user_data:
        return User(user_data[0], user_data[1], user_data[2])
    return None

# Routen
@app.route('/')
def index():
    # Umleitung zur Technik-Bewertung als Startseite
    return redirect(url_for('technik_bewertung'))

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Überprüfen, ob der Benutzername bereits existiert
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            conn.close()
            flash('Benutzername existiert bereits!')
            return redirect(url_for('register'))
        
        # Neuen Benutzer anlegen
        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
        conn.commit()
        
        # Neuen Benutzer laden und einloggen
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user_data = cursor.fetchone()
        conn.close()
        
        user = User(user_data[0], user_data[1], user_data[2])
        login_user(user)
        
        flash('Registrierung erfolgreich!')
        return redirect(url_for('index'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user_data = cursor.fetchone()
        conn.close()
        
        if user_data and check_password_hash(user_data[2], password):
            user = User(user_data[0], user_data[1], user_data[2])
            login_user(user)
            flash('Login erfolgreich!')
            return redirect(url_for('index'))
        else:
            flash('Ungültiger Benutzername oder Passwort!')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Sie wurden abgemeldet!')
    return redirect(url_for('index'))

@app.route('/saved_calculations')
@login_required
def saved_calculations():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, date FROM calculations WHERE user_id = ? ORDER BY date DESC", (current_user.id,))
    calculations = cursor.fetchall()
    conn.close()
    
    return render_template('saved_calculations.html', calculations=calculations)

@app.route('/view_calculation/<int:calc_id>')
@login_required
def view_calculation(calc_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM calculations WHERE id = ? AND user_id = ?", (calc_id, current_user.id))
    calculation = cursor.fetchone()
    conn.close()
    
    if not calculation:
        flash('Berechnung nicht gefunden!')
        return redirect(url_for('saved_calculations'))
    
    # Daten aus der Datenbank laden und in die Session übertragen
    calculation_data = json.loads(calculation[4])
    session['last_calculation'] = calculation_data
    
    # Zur Ergebnisseite weiterleiten
    return redirect(url_for('result'))

@app.route('/delete_calculation/<int:calc_id>')
@login_required
def delete_calculation(calc_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM calculations WHERE id = ? AND user_id = ?", (calc_id, current_user.id))
    conn.commit()
    conn.close()
    
    flash('Berechnung wurde gelöscht!')
    return redirect(url_for('saved_calculations'))



@app.route('/technik_bewertung')
def technik_bewertung():
    # Session zurücksetzen für neue Bewertung
    if 'technik_evaluation' in session:
        session.pop('technik_evaluation')
    if 'kpi_evaluation' in session:
        session.pop('kpi_evaluation')
    if 'user_evaluation' in session:
        session.pop('user_evaluation')
    if 'last_calculation' in session:
        session.pop('last_calculation')
    
    return render_template('technik.html')

@app.route('/kpi_bewertung')
def kpi_bewertung():
    # Überprüfen, ob die Technik-Bewertung bereits durchgeführt wurde
    if 'technik_evaluation' not in session:
        return redirect(url_for('technik_bewertung'))
    
    return render_template('kpi.html')

@app.route('/process_kpi', methods=['POST'])
def process_kpi():
    print("\n=== PROCESS KPI DEBUG (ENHANCED) ===\n")
    
    # Extract values from the KPI form
    strategic_relevance = request.form.get('strategic_relevance', '3')
    roi_potential = request.form.get('roi_potential', '3')
    selected_kpis_json = request.form.get('selected_kpis', '[]')
    
    print(f"Form data received:")
    print(f"  strategic_relevance: {strategic_relevance}")
    print(f"  roi_potential: {roi_potential}")
    print(f"  selected_kpis_json: {selected_kpis_json}")
    
    try:
        # Parse the JSON string of selected KPIs
        selected_kpis = json.loads(selected_kpis_json)
        print(f"Successfully parsed selected_kpis JSON: {selected_kpis}")
        print(f"Type of selected_kpis: {type(selected_kpis)}")
        print(f"Number of selected KPIs: {len(selected_kpis)}")
        
        # Calculate the KPI score (average of all selected KPI scores)
        total_score = 0.0
        valid_kpis = 0
        
        for kpi in selected_kpis:
            print(f"Processing KPI: {kpi}")
            # Check if 'score' key exists in the KPI object
            if 'score' in kpi:
                try:
                    score = float(kpi['score'])
                    print(f"  KPI {kpi.get('text', 'Unknown')}: Valid score {score}")
                    total_score += score
                    valid_kpis += 1
                except (ValueError, TypeError) as e:
                    print(f"  KPI {kpi.get('text', 'Unknown')}: Error converting score to float: {e}")
                    print(f"  Using default score 0.5 for this KPI")
                    total_score += 0.5
                    valid_kpis += 1
            else:
                print(f"  KPI {kpi.get('text', 'Unknown')}: No 'score' key found")
                print(f"  Using default score 0.5 for this KPI")
                total_score += 0.5
                valid_kpis += 1
        
        # Calculate the average score, default to 0.5 if no valid KPIs
        kpi_score = total_score / valid_kpis if valid_kpis > 0 else 0.5
        print(f"Calculated KPI score (average): {kpi_score} from {valid_kpis} valid KPIs with total score {total_score}")
    except json.JSONDecodeError as e:
        print(f"Error parsing selected_kpis JSON: {e}")
        selected_kpis = []
        kpi_score = 0.5  # Default to middle value if parsing fails
        print(f"Using default KPI score: {kpi_score}")
    
    # Store the evaluation in the session
    session['kpi_evaluation'] = {
        'strategic_relevance': strategic_relevance,
        'selected_kpis': selected_kpis,
        'roi_potential': roi_potential,
        'kpi_score': kpi_score,
        'debug_info': {
            'raw_selected_kpis': selected_kpis_json,
            'parsed_selected_kpis': selected_kpis,
            'calculated_kpi_score': kpi_score,
            'valid_kpis_count': valid_kpis if 'valid_kpis' in locals() else 0,
            'total_score': total_score if 'total_score' in locals() else 0
        }
    }
    
    print(f"Stored in session: {session['kpi_evaluation']}")
    print("\n=== END PROCESS KPI DEBUG (ENHANCED) ===\n")
    
    # Redirect to user readiness assessment
    return redirect(url_for('user_readiness'))

@app.route('/user_readiness')
def user_readiness():
    # Check if both technik and KPI evaluations are completed
    if 'technik_evaluation' not in session or 'kpi_evaluation' not in session:
        return redirect(url_for('technik_bewertung'))
    
    return render_template('user_readiness.html')

@app.route('/process_user_readiness', methods=['POST'])
def process_user_readiness():
    # Check if both technik and KPI evaluations are completed
    if 'technik_evaluation' not in session or 'kpi_evaluation' not in session:
        return redirect(url_for('technik_bewertung'))
    
    # Extract values from the user readiness form
    performance_expectancy = request.form.get('performance_expectancy', 'partially')
    effort_expectancy = request.form.get('effort_expectancy', 'partially')
    social_influence = request.form.get('social_influence', 'partially')
    facilitating_conditions = request.form.get('facilitating_conditions', 'partially')
    trust_in_tech = request.form.get('trust_in_tech', 'partially')
    perceived_threat = request.form.get('perceived_threat', 'partially')
    
    # Calculate user readiness score based on the simplified scoring system
    # Yes = 1.0, Partially = 0.5, No = 0.0
    user_score = 0.0
    
    # Performance Expectancy
    if performance_expectancy == 'yes':
        performance_score = 1.0
    elif performance_expectancy == 'partially':
        performance_score = 0.5
    else:  # 'no'
        performance_score = 0.0
    user_score += performance_score
    
    # Effort Expectancy
    if effort_expectancy == 'yes':
        effort_score = 1.0
    elif effort_expectancy == 'partially':
        effort_score = 0.5
    else:  # 'no'
        effort_score = 0.0
    user_score += effort_score
    
    # Social Influence
    if social_influence == 'yes':
        social_score = 1.0
    elif social_influence == 'partially':
        social_score = 0.5
    else:  # 'no'
        social_score = 0.0
    user_score += social_score
    
    # Facilitating Conditions
    if facilitating_conditions == 'yes':
        facilitating_score = 1.0
    elif facilitating_conditions == 'partially':
        facilitating_score = 0.5
    else:  # 'no'
        facilitating_score = 0.0
    user_score += facilitating_score
    
    # Trust in Tech
    if trust_in_tech == 'yes':
        trust_score = 1.0
    elif trust_in_tech == 'partially':
        trust_score = 0.5
    else:  # 'no'
        trust_score = 0.0
    user_score += trust_score
    
    # Perceived Threat (inverted: No = 1.0, Partially = 0.5, Yes = 0.0)
    if perceived_threat == 'no':
        threat_score = 1.0
    elif perceived_threat == 'partially':
        threat_score = 0.5
    else:  # 'yes'
        threat_score = 0.0
    user_score += threat_score
    
    # Normalize to 0-1 scale (divide by 6 components)
    user_score = user_score / 6.0
    
    # Determine readiness level and color code
    if user_score >= 0.7:
        readiness_level = "Hohe Bereitschaft"
        color_code = "🟢"
        interpretation = "Die Organisation ist gut vorbereitet für die Technologie-Adoption."
        recommendation = ""
    elif user_score >= 0.4:
        readiness_level = "Mittlere Bereitschaft"
        color_code = "🟡"
        interpretation = "Die Organisation zeigt moderate Bereitschaft für die Technologie-Adoption."
        recommendation = "Fokussieren Sie sich auf die Verbesserung der schwächsten Dimensionen."
    else:
        readiness_level = "Niedrige Bereitschaft"
        color_code = "🔴"
        interpretation = "Die Organisation zeigt erhebliche Lücken in der Bereitschaft für die Technologie-Adoption."
        recommendation = "Ein umfassendes Change-Management und Schulungsprogramm wird dringend empfohlen."
    
    # Store the user readiness evaluation in the session
    session['user_readiness_evaluation'] = {
        'performance_expectancy': performance_expectancy,
        'performance_score': performance_score,
        'effort_expectancy': effort_expectancy,
        'effort_score': effort_score,
        'social_influence': social_influence,
        'social_score': social_score,
        'facilitating_conditions': facilitating_conditions,
        'facilitating_score': facilitating_score,
        'trust_in_tech': trust_in_tech,
        'trust_score': trust_score,
        'perceived_threat': perceived_threat,
        'threat_score': threat_score,
        'user_score': user_score,
        'readiness_level': readiness_level,
        'color_code': color_code,
        'interpretation': interpretation,
        'recommendation': recommendation
    }
    
    # Calculate the final result and redirect to the result page
    calculate_result()
    return redirect(url_for('result'))

@app.route('/process_technik', methods=['POST'])
def process_technik():
    # Werte aus dem Technik-Formular extrahieren
    concept_status = request.form.get('concept_status', 'nein')
    validation = request.form.get('validation', 'nein')
    prototype = request.form.get('prototype', 'nein')
    integration = request.form.get('integration', 'nein')
    maturity = request.form.get('maturity', 'nein')
    
    # Technik-Score berechnen
    technik_score = 0.0
    
    # Konzeptstatus
    if concept_status == 'nein':
        technik_score = 0.0
    elif concept_status == 'skizzen':
        technik_score = 0.2
    elif concept_status == 'konzept':
        technik_score = 0.3
    
    # Validierung
    if validation == 'intern':
        technik_score = 0.4
    elif validation == 'extern':
        technik_score = 0.5
    
    # Prototypstatus
    if prototype == 'entwicklung':
        technik_score = 0.6
    elif prototype == 'test':
        technik_score = 0.7
    
    # Integration
    if integration == 'schnittstellen':
        technik_score = 0.8
    elif integration == 'teilweise':
        technik_score = 0.85
    elif integration == 'vollständig':
        technik_score = 0.9
    
    # Betriebsreife
    if maturity == 'erste':
        technik_score = 0.95
    elif maturity == 'produktiv':
        technik_score = 1.0
    
    # Speichere die Technik-Bewertung in der Session
    session['technik_evaluation'] = {
        'concept_status': concept_status,
        'validation': validation,
        'prototype': prototype,
        'integration': integration,
        'maturity': maturity,
        'technik_score': technik_score
    }
    
    # Weiterleitung zur KPI-Bewertung
    return redirect(url_for('kpi_bewertung'))

# KPI-Bewertung wurde entfernt

@app.route('/user_bewertung')
def user_bewertung():
    # Überprüfen, ob die Technik-Bewertung bereits durchgeführt wurde
    if 'technik_evaluation' not in session:
        return redirect(url_for('technik_bewertung'))
    
    return render_template('user.html')

@app.route('/process_user', methods=['POST'])
def process_user():
    # Überprüfen, ob die Technik-Bewertung bereits durchgeführt wurde
    if 'technik_evaluation' not in session:
        return redirect(url_for('technik_bewertung'))
    
    # Werte aus dem Nutzer-Formular extrahieren
    user_acceptance = int(request.form.get('user_acceptance', 3))
    training_effort = int(request.form.get('training_effort', 3))
    process_change = int(request.form.get('process_change', 3))
    user_benefit = int(request.form.get('user_benefit', 3))
    
    # Berechne den durchschnittlichen Nutzer-Score
    # Für Training-Effort und Process-Change: Niedrigere Werte sind besser (5 -> 1, 4 -> 2, ...)
    training_score = 6 - training_effort
    process_change_score = 6 - process_change
    
    avg_user_score = (user_acceptance + training_score + process_change_score + user_benefit) / 4
    
    # Speichere die Nutzer-Bewertung in der Session
    session['user_evaluation'] = {
        'user_acceptance': user_acceptance,
        'training_effort': training_effort,
        'process_change': process_change,
        'user_benefit': user_benefit,
        'avg_user_score': avg_user_score
    }
    
    # Berechnung des Gesamtergebnisses
    calculate_result()
    
    # Weiterleitung zur Ergebnisseite
    return redirect(url_for('result'))

def calculate_result():
    print("\n=== CALCULATE RESULT DEBUG (ENHANCED) ===\n")
    
    # Get the technik_score and integration status from the session
    technik_evaluation = session.get('technik_evaluation', {})
    technik_score = technik_evaluation.get('technik_score', 0.0)
    integration_status = technik_evaluation.get('integration', 'nein')
    print(f"Retrieved technik_score from session: {technik_score}")
    print(f"Retrieved integration_status from session: {integration_status}")
    
    # Get the kpi_score from the session
    kpi_evaluation = session.get('kpi_evaluation', {})
    kpi_score = kpi_evaluation.get('kpi_score', 0.5)  # Default to 0.5 if not found
    print(f"Retrieved kpi_score from session: {kpi_score}")
    print(f"Full kpi_evaluation data: {kpi_evaluation}")
    
    # Get the user readiness score from the session
    user_readiness_evaluation = session.get('user_readiness_evaluation', {})
    user_score = user_readiness_evaluation.get('user_score', 0.5)  # Default to 0.5 if not found
    print(f"Retrieved user_score from session: {user_score}")
    print(f"Full user_readiness_evaluation data: {user_readiness_evaluation}")
    
    # Determine weights based on integration status
    # If integration is 'teilweise' ('Partially') or 'vollständig' ('Yes'), increase user readiness weight
    # If integration is 'nein' ('No') or 'schnittstellen' ('Schnittstellen definiert'), use default weights
    if integration_status in ['teilweise', 'vollständig']:
        kpi_weight = 0.3
        technik_weight = 0.3
        user_weight = 0.4
        weight_explanation = "Da die Lösung bereits teilweise oder vollständig in bestehende Systeme integriert ist, wurde die Nutzerbereitschaft höher gewichtet (40%), während Technik und KPIs jeweils mit 30% in die Gesamtbewertung einfließen."
    else:  # 'nein' or 'schnittstellen'
        kpi_weight = 0.4
        technik_weight = 0.4
        user_weight = 0.2
        weight_explanation = "Da die Lösung noch nicht in bestehende Systeme integriert ist, wurden Technik und KPIs höher gewichtet (je 40%), während die Nutzerbereitschaft mit 20% in die Gesamtbewertung einfließt."
    
    # Calculate the total score with dynamic weights
    total_score = (technik_score * technik_weight) + (kpi_score * kpi_weight) + (user_score * user_weight)
    print(f"Calculated total_score: {total_score} = (technik_score {technik_score} * {technik_weight}) + (kpi_score {kpi_score} * {kpi_weight}) + (user_score {user_score} * {user_weight})")
    print(f"Weight explanation: {weight_explanation}")
    
    # Process the selected KPIs for display
    selected_kpis = []
    if 'selected_kpis' in kpi_evaluation:
        print(f"Processing selected KPIs from kpi_evaluation: {kpi_evaluation['selected_kpis']}")
        for kpi in kpi_evaluation['selected_kpis']:
            kpi_value = kpi.get('value', '')
            kpi_text = kpi.get('text', '')
            kpi_score = kpi.get('score', 0.5)  # Default to 0.5 if not found
            kpi_position = kpi.get('position', 3)  # Default to 3 if not found
            
            print(f"Processing KPI: value={kpi_value}, text={kpi_text}, score={kpi_score}, position={kpi_position}")
            
            # Map the 0-1 score to a 1-5 cursor position if needed
            if 'position' not in kpi:
                if kpi_score <= 0.0:
                    kpi_position = 1
                elif kpi_score <= 0.25:
                    kpi_position = 2
                elif kpi_score <= 0.5:
                    kpi_position = 3
                elif kpi_score <= 0.75:
                    kpi_position = 4
                else:
                    kpi_position = 5
                print(f"  Mapped score {kpi_score} to position {kpi_position}")
            
            selected_kpis.append({
                'value': kpi_value,
                'text': kpi_text,
                'score': kpi_score,
                'position': kpi_position
            })
    else:
        print("No selected KPIs found in kpi_evaluation")
    
    # Store the calculation details in the session
    session['calculation'] = {
        'technik_score': technik_score,
        'kpi_score': kpi_score,
        'user_score': user_score,
        'total_score': total_score,
        'selected_kpis': selected_kpis,
        'technik_details': technik_evaluation.get('details', {}),
        'user_readiness_details': user_readiness_evaluation,
        'weights': {
            'technik_weight': technik_weight,
            'kpi_weight': kpi_weight,
            'user_weight': user_weight,
            'weight_explanation': weight_explanation,
            'integration_status': integration_status
        }
    }
    
    print(f"Stored calculation in session: {session['calculation']}")
    print("\n=== END CALCULATE RESULT DEBUG (ENHANCED) ===\n")
    
    return total_score

@app.route('/result')
def result():
    print("\n=== RESULT ROUTE DEBUG (ENHANCED) ===\n")
    
    # Get the calculation from the session
    calculation = session.get('calculation', {})
    print(f"Retrieved calculation from session: {calculation}")
    
    # Extract scores
    total_score = calculation.get('total_score', 0.0)
    technik_score = calculation.get('technik_score', 0.0)
    kpi_score = calculation.get('kpi_score', 0.5)  # Default to 0.5 if not found
    user_score = calculation.get('user_score', 0.5)  # Default to 0.5 if not found
    
    print(f"Extracted scores: total={total_score}, technik={technik_score}, kpi={kpi_score}, user={user_score}")
    
    # Format scores as percentages for display
    total_score_percent = f"{total_score * 100:.1f}%"
    technik_score_percent = f"{technik_score * 100:.1f}%"
    kpi_score_percent = f"{kpi_score * 100:.1f}%"
    user_score_percent = f"{user_score * 100:.1f}%"
    
    # Determine status based on total score
    if total_score >= 0.7:
        status = "Gut"
        recommendation = "Die Technologie ist reif und die KPIs sind vielversprechend. Eine Implementierung wird empfohlen."
    elif total_score >= 0.4:
        status = "Mittel"
        recommendation = "Die Technologie und KPIs zeigen Potenzial, aber es gibt noch Verbesserungsbedarf. Eine Pilotimplementierung könnte sinnvoll sein."
    else:
        status = "Schlecht"
        recommendation = "Die Technologie ist noch nicht reif genug oder die KPIs sind nicht überzeugend. Es wird empfohlen, die Implementierung zu verschieben."
    
    print(f"Status: {status}, Recommendation: {recommendation}")
    
    # Get technical details
    technik_details = calculation.get('technik_details', {})
    print(f"Technical details: {technik_details}")
    
    # Get selected KPIs
    selected_kpis = calculation.get('selected_kpis', [])
    print(f"Selected KPIs: {selected_kpis}")
    
    # Get user readiness score and details
    user_score = calculation.get('user_score', 0.0)
    user_readiness_details = calculation.get('user_readiness_details', {})
    print(f"User score: {user_score}")
    print(f"User readiness details: {user_readiness_details}")
    
    # Render the result template with all the data
    return render_template('result.html',
                          total_score=total_score,
                          total_score_percent=total_score_percent,
                          technik_score=technik_score,
                          technik_score_percent=technik_score_percent,
                          kpi_score=kpi_score,
                          kpi_score_percent=kpi_score_percent,
                          user_score=user_score,
                          user_score_percent=int(user_score * 100),
                          status=status,
                          recommendation=recommendation,
                          technik_details=technik_details,
                          selected_kpis=selected_kpis,
                          user_readiness_details=user_readiness_details,
                          calculation=calculation)

@app.route('/save_calculation', methods=['POST'])
@login_required
def save_calculation():
    # Überprüfen, ob eine Berechnung vorhanden ist
    if 'last_calculation' not in session:
        flash('Keine Berechnung zum Speichern vorhanden!')
        return redirect(url_for('index'))
    
    # Name für die Berechnung aus dem Formular extrahieren
    calculation_name = request.form.get('calculation_name', 'Unbenannte Berechnung')
    
    # Aktuelles Datum und Zeit
    current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Berechnung in der Datenbank speichern
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO calculations (user_id, name, date, data) VALUES (?, ?, ?, ?)",
        (current_user.id, calculation_name, current_date, json.dumps(session['last_calculation']))
    )
    conn.commit()
    conn.close()
    
    flash('Berechnung wurde gespeichert!')
    return redirect(url_for('result'))

if __name__ == '__main__':
    app.run(debug=True, port=5005)