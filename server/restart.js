// Quick script to restart the server 
// This allows changes to take effect without manually restarting

const { exec } = require('child_process');
const path = require('path');

console.log('Stopping any running server processes...');

// Windows specific way to find and kill node processes
exec('taskkill /f /im node.exe', (error) => {
  // Ignore the error if no processes were found
  console.log('Starting server again...');
  
  // Start the server - main server file is in the parent directory
  const serverProcess = exec('node ../server.js', {
    cwd: path.join(__dirname)
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(data);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(data);
  });
  
  console.log('Server restarting! You may need to refresh your browser.');
}); 