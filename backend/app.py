from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

def load_contracts():
    """Loads contract data from CSV"""
    try:
        df = pd.read_csv('../public/data/geocoded_data1.csv')
        return df
    except Exception as e:
        return None

@app.route('/api/states', methods=['GET'])
def get_states():
    try:
        df = load_contracts()
        if df is None:
            return jsonify({"error": "Could not load contract data"}), 500
        
        states = df['Entity State'].dropna().unique().tolist() 
        print("States:", states)  
        
        return jsonify(states) 
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/descriptions', methods=['GET'])
def get_descriptions():
    try:
        df = load_contracts()
        if df is None:
            return jsonify({"error": "Could not load contract data"}), 500
        
        descriptions = df['NAICS Description'].dropna().unique().tolist() 
        print("States:", descriptions)
        return jsonify(descriptions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/contracts', methods=['GET'])
def get_contracts():
    try:
        df = load_contracts()
        if df is None:
            return jsonify({"error": "Could not load contract data"}), 500

        state = request.args.get('state', '').strip().lower()
        min_cost = request.args.get('min_cost', '')
        max_cost = request.args.get('max_cost', '')
        department = request.args.get('department', '').strip().lower()
        tags = request.args.getlist('tags')  

        print("\n=== Received Filter Parameters ===")
        print(f"State: {state}, Min Cost: {min_cost}, Max Cost: {max_cost}, Department: {department}, Tags: {tags}")

        if state:
            df = df[df['Entity State'].str.lower() == state]
            print(f"Filtered by state ({state}): {len(df)} records")

        if min_cost.isnumeric():
            df = df[df['Action Obligation ($)'].astype(float) >= float(min_cost)]
            print(f"Filtered by min cost ({min_cost}): {len(df)} records")

        if max_cost.isnumeric():
            df = df[df['Action Obligation ($)'].astype(float) <= float(max_cost)]
            print(f"Filtered by max cost ({max_cost}): {len(df)} records")

        if department:
            df = df[df['Contracting Agency'].str.lower().str.contains(department, na=False)]
            print(f"Filtered by department ({department}): {len(df)} records")

        if tags:
            df = df[df['Tags'].apply(lambda x: any(tag.lower() in str(x).lower() for tag in tags))]
            print(f"Filtered by tags ({tags}): {len(df)} records")

        contracts = df.fillna('').to_dict(orient='records')

        print(f"\n=== Final Filtered Contracts (Showing up to 5) ===")
        print(df.head(5))
        return jsonify(contracts)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
