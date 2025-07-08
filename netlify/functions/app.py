import sys
import os
import json

# Add the parent directory to the path so we can import our Flask app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app import app

# This script is called by the JavaScript wrapper
def main():
    # Check if an event was passed as an argument
    if len(sys.argv) > 1:
        event = json.loads(sys.argv[1])
        
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
            
            result = {
                'statusCode': response.status_code,
                'headers': dict(response.headers),
                'body': response.get_data(as_text=True)
            }
            
            # Print the result as JSON for the JavaScript wrapper to capture
            print(json.dumps(result))

if __name__ == '__main__':
    main()