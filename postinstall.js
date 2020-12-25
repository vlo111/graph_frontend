const { exec } = require('child_process');

exec('cd ./node_modules/react-notification-timeline && chmod 777 ./build.sh && ./build.sh', (err, stdout, stderr) => {
  if (err) {
    console.log('Error:', err);
  }
  if (stdout) {
    console.log('Stdout:', stdout);
  }
  if (stderr) {
    console.log('Stderr:', stderr);
  }
});
