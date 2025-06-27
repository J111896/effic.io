from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import json
import datetime

# Datenbankpfad
DB_PATH = os.path.join(os.path.dirname(__file__), 'users.db')

def init_db():
    """Initialisiert die Datenbank mit der Benutzertabelle"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Benutzertabelle erstellen
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Berechnungstabelle erstellen
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        branche TEXT NOT NULL,
        comment TEXT,
        score REAL NOT NULL,
        score_comment TEXT,
        kpi_values TEXT NOT NULL,
        datum TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    conn.commit()
    conn.close()

class User(UserMixin):

class Calculation:
    """Modell für gespeicherte Berechnungen"""
    
    def __init__(self, id, user_id, branche, comment, score, score_comment, kpi_values, datum):
        self.id = id
        self.user_id = user_id
        self.branche = branche
        self.comment = comment
        self.score = score
        self.score_comment = score_comment
        self.kpi_values = kpi_values if isinstance(kpi_values, dict) else json.loads(kpi_values)
        self.datum = datum
    
    @staticmethod
    def get_by_id(calculation_id):
        """Berechnung anhand der ID abrufen"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, user_id, branche, comment, score, score_comment, kpi_values, datum 
            FROM calculations 
            WHERE id = ?
        """, (calculation_id,))
        calc_data = cursor.fetchone()
        conn.close()
        
        if calc_data:
            return Calculation(
                calc_data[0], calc_data[1], calc_data[2], calc_data[3], 
                calc_data[4], calc_data[5], calc_data[6], calc_data[7]
            )
        return None
    
    @staticmethod
    def get_by_user_id(user_id):
        """Alle Berechnungen eines Benutzers abrufen"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, user_id, branche, comment, score, score_comment, kpi_values, datum 
            FROM calculations 
            WHERE user_id = ?
            ORDER BY datum DESC
        """, (user_id,))
        calculations = []
        for row in cursor.fetchall():
            calculations.append(Calculation(
                row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]
            ))
        conn.close()
        return calculations
    
    @staticmethod
    def create_calculation(user_id, branche, comment, score, score_comment, kpi_values):
        """Neue Berechnung erstellen"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # KPI-Werte als JSON speichern
        kpi_values_json = json.dumps(kpi_values)
        
        cursor.execute("""
            INSERT INTO calculations 
            (user_id, branche, comment, score, score_comment, kpi_values, datum) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, branche, comment, score, score_comment, 
            kpi_values_json, datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        
        calculation_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return Calculation.get_by_id(calculation_id)
    
    @staticmethod
    def delete_calculation(calculation_id):
        """Berechnung löschen"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM calculations WHERE id = ?", (calculation_id,))
        success = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return success