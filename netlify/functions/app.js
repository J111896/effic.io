// JavaScript wrapper for the Python serverless function
// This file is needed for netlify-lambda to properly build the function

const { spawn } = require('child_process');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Call the Python handler
    const pythonProcess = spawn('python', [path.join(__dirname, 'app.py'), JSON.stringify(event)]);
    
    let result = '';
    
    // Collect data from stdout
    for await (const chunk of pythonProcess.stdout) {
      result += chunk.toString();
    }
    
    // Parse the result
    const response = JSON.parse(result);
    
    return {
      statusCode: response.statusCode || 200,
      headers: response.headers || {},
      body: response.body || ''
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request: ' + error.message })
    };
  }
};