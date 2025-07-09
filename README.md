# Efficio App

A Flask-based web application for KI-Projekt Bewertungstool.

## Project Overview

This application is built with Flask and uses SQLite for data storage. It provides user authentication and calculation features.

## Deployment Instructions for PythonAnywhere

### 1. Sign up for PythonAnywhere

If you don't already have an account, sign up at [PythonAnywhere](https://www.pythonanywhere.com/). The free tier is sufficient to get started.

### 2. Upload Your Code

1. From your PythonAnywhere dashboard, go to the "Files" tab
2. Create a new directory for your application (e.g., `efficio`)
3. Upload your application files using the upload button, or use Git:
   ```bash
   git clone https://github.com/J111896/effic.io.git efficio
   ```

### 3. Set Up a Virtual Environment

1. Open a Bash console from your dashboard
2. Navigate to your project directory:
   ```bash
   cd efficio
   ```
3. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
4. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

### 4. Initialize the Database

1. Run the database initialization script:
   ```bash
   python init_db.py
   ```

### 5. Configure a Web App

1. Go to the "Web" tab on your dashboard
2. Click "Add a new web app"
3. Choose "Manual configuration" (not "Flask")
4. Select Python version 3.9
5. Enter the path to your project directory (e.g., `/home/yourusername/efficio`)
6. Configure the WSGI file:
   - Click on the WSGI configuration file link
   - Replace the contents with the following:
   ```python
   import sys
   import os
   
   # Add your project directory to the sys.path
   project_home = '/home/yourusername/efficio'
   if project_home not in sys.path:
       sys.path.insert(0, project_home)
   
   # Import your Flask app
   from app import app as application
   
   # This is important for PythonAnywhere
   application.secret_key = os.environ.get('SECRET_KEY', 'efficio_secret_key')
   ```
   - Save the file

7. Set up static files:
   - In the "Static Files" section, add:
     - URL: `/static/`
     - Directory: `/home/yourusername/efficio/static`

### 6. Set Environment Variables

1. Create a `.env` file in your project directory with your configuration:
   ```bash
   cd ~/efficio
   cp .env.example .env
   nano .env  # Edit with your values
   ```

2. Set a strong SECRET_KEY and any other environment variables.

### 7. Start the Web App

1. Click the "Reload" button for your web app
2. Your application should now be running at `yourusername.pythonanywhere.com`

### 8. Troubleshooting

- Check the error logs in the "Web" tab if your application doesn't start
- Ensure all file paths are correct for your PythonAnywhere username
- Make sure the database file is writable:
  ```bash
  chmod 664 ~/efficio/efficio.db
  ```
- If static files aren't loading, check the static files configuration

## Local Development

To run the application locally:

1. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

2. Initialize the database (if needed):
   ```bash
   python init_db.py
   ```

3. Run the application:
   ```bash
   python app.py
   ```

The application will be available at `http://localhost:5000`.