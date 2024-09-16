const express = require('express');
const fs = require('fs');
const redis = require('redis');
const rateLimit = require('express-rate-limit');

const app = express();
const client = redis.createClient();  // Create Redis client
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Rate limit: 1 task per second and 20 tasks per minute
const limiter = rateLimit({
  windowMs: 1000, // 1 second window
  max: 1, // limit each user to 1 request per second
  skipSuccessfulRequests: true,
});

// Handle Redis connection error
client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Ensure the Redis client is connected before making any requests
async function connectRedisClient() {
  if (!client.isOpen) {
    await client.connect();
  }
}

// Route to queue tasks and manage rate limits per user
app.post('/task', limiter, async (req, res) => {
    const userId = req.body.user_id;
    const currentTime = Date.now(); // This is a number
  
    try {
      // Ensure Redis client is connected
      await connectRedisClient();
  
      // Fetch user's tasks using Redis (async/await)
      const tasks = await client.lRange(userId, 0, -1);
  
      // Check if user has exceeded the rate limit (20 tasks per minute)
      const oneMinuteAgo = currentTime - 60000; // 60 seconds in milliseconds
      const taskCount = tasks.filter(taskTime => taskTime > oneMinuteAgo).length;
  
      if (taskCount >= 20) {
        return res.status(429).send('Rate limit exceeded: Max 20 tasks per minute');
      }
  
      // Convert currentTime to a string and add task to Redis queue
      await client.rPush(userId, currentTime.toString());  // Convert number to string
  
      // Process the task
      task(userId);
      res.status(200).send('Task is being processed');
    } catch (err) {
      console.error('Error interacting with Redis:', err);
      res.status(500).send('Internal server error');
    }
  });
  
// Task processing function
async function task(user_id) {
  const logMessage = `${user_id} - task completed at ${Date.now()}\n`;

  // Log the task completion to a file
  fs.appendFile('task_log.txt', logMessage, (err) => {
    if (err) {
      console.error('Error logging task:', err);
    } else {
      console.log(`${user_id} task logged.`);
    }
  });
}

// Start the server
app.listen(PORT, async () => {
  // Ensure Redis client is connected before starting the server
  await connectRedisClient();
  console.log(`Server running on port ${PORT}`);
});
