#!/usr/bin/env python3

print('\n=== DEBUGGING KPI SCORE CALCULATION ===\n')
print('Let\'s check how the normalizePositionToScore function works:')

# Simulate the JavaScript function in Python
def normalize_position_to_score(position):
    position_value = int(position)
    if position_value == 1:
        return 0.0
    elif position_value == 2:
        return 0.25
    elif position_value == 3:
        return 0.5
    elif position_value == 4:
        return 0.75
    elif position_value == 5:
        return 1.0
    else:
        return 0.5  # Default value for unknown position

# Test the function with positions 1-5
for pos in range(1, 6):
    score = normalize_position_to_score(pos)
    print(f'Position {pos} -> Score: {score}')

print('\nNow let\'s simulate the KPI score calculation in app.py:')

# Simulate selected KPIs with different positions
selected_kpis = [
    {'value': 'umsatz', 'text': 'Umsatz', 'position': 1, 'score': 0.0},
    {'value': 'kosten', 'text': 'Kosten', 'position': 3, 'score': 0.5},
    {'value': 'durchlaufzeit', 'text': 'Durchlaufzeit', 'position': 5, 'score': 1.0}
]

print('\nSelected KPIs:')
for kpi in selected_kpis:
    print(f"KPI: {kpi['text']}, Position: {kpi['position']}, Score: {kpi['score']}")

# Calculate KPI score (average of all selected KPI scores)
total_score = 0.0
valid_kpis = 0

for kpi in selected_kpis:
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
print(f"\nCalculated KPI score (average): {kpi_score} from {valid_kpis} valid KPIs with total score {total_score}")

print('\nThis should match the calculation in app.py')