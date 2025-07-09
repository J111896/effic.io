# PythonAnywhere WSGI configuration file

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