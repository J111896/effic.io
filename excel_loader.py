import pandas as pd

def load_branchen_and_kpis():
    """
    Lädt die Branchen und KPIs aus der Excel-Datei.
    
    Returns:
        dict: Ein Dictionary mit Branchen als Schlüssel und Listen von KPIs als Werte
    """
    try:
        # Excel-Datei laden
        branchen_data = pd.read_excel('240115 Evaluation Grid.xlsx', sheet_name='Branchen')
        
        # Dictionary für Branchen und KPIs erstellen
        branchen_kpis = {}
        
        # Alle einzigartigen Branchen extrahieren
        branchen = branchen_data['Branche'].unique()
        
        # KPIs pro Branche extrahieren
        for branche in branchen:
            branchen_kpis[branche] = []
            branche_data = branchen_data[branchen_data['Branche'] == branche]
            
            for _, row in branche_data.iterrows():
                kpi = {
                    'ID': row.get('ID'),
                    'KPI-Name': row.get('KPI-Name'),
                    'KPI-Erklärung': row.get('KPI-Erklärung'),
                    'Mess-Einheit': row.get('Mess-Einheit'),
                    'Oberer Benchmark': row.get('Oberer Benchmark'),
                    'Mittlerer Benchmark': row.get('Mittlerer Benchmark'),
                    'Unterer Benchmark': row.get('Unterer Benchmark'),
                    'Branchen-Messeinheit': row.get('Branchen-Messeinheit'),
                    'Zielwert': row.get('Zielwert'),
                    'Text': row.get('Text')
                }
                
                # Tooltip-Text erstellen mit Benchmark-Informationen
                benchmark_info = []
                if kpi.get('Oberer Benchmark') is not None:
                    benchmark_info.append(f"Oberer Benchmark: {kpi['Oberer Benchmark']}")
                if kpi.get('Mittlerer Benchmark') is not None:
                    benchmark_info.append(f"Mittlerer Benchmark: {kpi['Mittlerer Benchmark']}")
                if kpi.get('Unterer Benchmark') is not None:
                    benchmark_info.append(f"Unterer Benchmark: {kpi['Unterer Benchmark']}")
                
                if benchmark_info:
                    kpi['Tooltip-Text'] = "\n".join(benchmark_info)
                elif kpi.get('Text'):
                    kpi['Tooltip-Text'] = kpi['Text']
                else:
                    kpi['Tooltip-Text'] = "Keine Benchmark-Daten verfügbar"
                branchen_kpis[branche].append(kpi)
        
        return branchen_kpis
    except Exception as e:
        print(f"Fehler beim Laden der Excel-Datei: {e}")
        # Fallback-Daten zurückgeben, wenn die Excel-Datei nicht geladen werden kann
        return {
            "Maschinenbau": [
                {"ID": 1, "KPI-Name": "Maschinenauslastung", "KPI-Erklärung": "Prozentsatz der Zeit, in der Maschinen produktiv genutzt werden", "Mess-Einheit": "%", "Tooltip-Text": "Oberer Benchmark: 85%\nMittlerer Benchmark: 70%\nUnterer Benchmark: 55%"},
                {"ID": 2, "KPI-Name": "Ausschussrate", "KPI-Erklärung": "Prozentsatz der fehlerhaften Produkte", "Mess-Einheit": "%", "Tooltip-Text": "Oberer Benchmark: 2%\nMittlerer Benchmark: 5%\nUnterer Benchmark: 10%"}
            ],
            "Logistik": [
                {"ID": 3, "KPI-Name": "Lieferpünktlichkeit", "KPI-Erklärung": "Prozentsatz der pünktlichen Lieferungen", "Mess-Einheit": "%", "Tooltip-Text": "Oberer Benchmark: 98%\nMittlerer Benchmark: 90%\nUnterer Benchmark: 80%"},
                {"ID": 4, "KPI-Name": "Transportkosten", "KPI-Erklärung": "Kosten pro transportierter Einheit", "Mess-Einheit": "€", "Tooltip-Text": "Oberer Benchmark: 0.5€\nMittlerer Benchmark: 1.0€\nUnterer Benchmark: 2.0€"}
            ],
            "E-Commerce": [
                {"ID": 5, "KPI-Name": "Conversion Rate", "KPI-Erklärung": "Prozentsatz der Besucher, die zu Käufern werden", "Mess-Einheit": "%", "Tooltip-Text": "Oberer Benchmark: 5%\nMittlerer Benchmark: 3%\nUnterer Benchmark: 1%"},
                {"ID": 6, "KPI-Name": "Warenkorbabbruchrate", "KPI-Erklärung": "Prozentsatz der abgebrochenen Bestellungen", "Mess-Einheit": "%", "Tooltip-Text": "Oberer Benchmark: 20%\nMittlerer Benchmark: 35%\nUnterer Benchmark: 50%"}
            ],
            "Pharma": [
                {"ID": 7, "KPI-Name": "Forschungseffizienz", "KPI-Erklärung": "Erfolgsrate neuer Medikamente", "Mess-Einheit": "%", "Tooltip-Text": "Oberer Benchmark: 15%\nMittlerer Benchmark: 10%\nUnterer Benchmark: 5%"},
                {"ID": 8, "KPI-Name": "Produktionsausbeute", "KPI-Erklärung": "Prozentsatz der nutzbaren Produktion", "Mess-Einheit": "%", "Tooltip-Text": "Oberer Benchmark: 95%\nMittlerer Benchmark: 90%\nUnterer Benchmark: 85%"}
            ]
        }