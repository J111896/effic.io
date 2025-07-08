import sys
import os

# Add the parent directory to the path so we can import our Flask app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app import app
from werkzeug.serving import WSGIRequestHandler

def handler(event, context):
    """
    Netlify Functions handler for Flask app
    """
    try:
        # For Netlify Functions, we need to handle the request differently
        # This is a simplified version - for production, you'd want to use
        # a proper WSGI adapter like serverless-wsgi
        
        # Extract the path from the event
        path = event.get('path', '/')
        method = event.get('httpMethod', 'GET')
        headers = event.get('headers', {})
        body = event.get('body', '')
        
        # Create a test client for the Flask app
        with app.test_client() as client:
            if method == 'GET':
                response = client.get(path, headers=headers)
            elif method == 'POST':
                response = client.post(path, data=body, headers=headers)
            else:
                response = client.open(path, method=method, data=body, headers=headers)
            
            return {
                'statusCode': response.status_code,
                'headers': dict(response.headers),
                'body': response.get_data(as_text=True)
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }