# wsgi.py file for PythonAnywhere deployment
from app import app as application

if __name__ == '__main__':
    application.run()