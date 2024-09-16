const redis = require('redis');
const fs = require('fs');

// Create and connect to the Redis client
const client = redis.createClient();

client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

// Ensure the client is ready before processing tasks
client.connect().then(() => {
  console.log('Redis client is ready to process tasks');

  function processTasks() {
    client.keys('*', (err, users) => {
      if (err) return console.error('Error fetching users:', err);

      users.forEach(user => {
        client.lpop(user, (err, taskTime) => {
          if (err || !taskTime) return;
          
          // Process task
          const logMessage = `${user} - task completed at ${Date.now()}\n`;
          fs.appendFile('task_log.txt', logMessage, (err) => {
            if (err) {
              console.error('Error logging task:', err);
            } else {
              console.log(`${user} task logged.`);
            }
          });
        });
      });
    });
  }

  // Process tasks every second
  setInterval(processTasks, 1000);
});
