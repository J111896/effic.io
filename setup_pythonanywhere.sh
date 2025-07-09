#!/bin/bash
# Setup script for PythonAnywhere deployment

echo "Setting up Efficio App on PythonAnywhere..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Initialize database if it doesn't exist
if [ ! -f "efficio.db" ]; then
    echo "Initializing database..."
    python init_db.py
fi

# Set proper permissions for the database
echo "Setting database permissions..."
chmod 664 efficio.db

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "Please edit the .env file with your configuration values."
fi

echo "Setup complete! Remember to:"
echo "1. Configure your WSGI file in the PythonAnywhere Web tab"
echo "2. Set up static files in the PythonAnywhere Web tab"
echo "3. Reload your web app"