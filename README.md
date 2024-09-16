# Node.js Task Queuing with Rate Limiting

This project implements a Node.js API that allows users to submit tasks with rate limiting. The API ensures that tasks submitted by users are processed according to a rate limit of **1 task per second** and **20 tasks per minute** per user. If a user exceeds these limits, their tasks are queued for later processing.

## Features

- **API Clustering**: The application runs as a cluster with two replica sets for load balancing and resilience.
- **Rate Limiting**: Limits task submission to 1 task per second and 20 tasks per minute per user.
- **Task Queueing**: Uses **Redis** to queue requests that exceed the rate limit.
- **Task Logging**: Logs completed tasks into a file (`task_log.txt`) with a timestamp and user ID.
- **Resilience**: Automatically restarts worker processes in case of failures.

## Prerequisites

Ensure you have the following installed:
- **Node.js** (version 14 or later)
- **Redis** (for task queueing and rate limiting)
- **npm** (Node package manager)

## Installation

### Step 1: Clone the repository
```bash
git clone <repository-url>
cd <repository-folder>
```
### Step 2: Install  dependencies
```bash
npm install
```
### Step 3: Start Redis
Ensure that Redis is running. If Redis is not installed, you can install and start it .

## Running the Application

### Step 1: Start the API cluster
```bash
node cluster.js
```
### Step 2:  Start the worker to process queued tasks
```bash
node worker.js
```
## API Usage
The API exposes a single route to submit tasks.

### POST /task
- Description: Submits a task to be processed. Each request must contain a user_id. The rate limit is applied per user.
* Rate Limits:
    * Maximum of 1 task per second per user.
    - Maximum of 20 tasks per minute per user.
    - Requests exceeding the rate limit are queued in Redis and processed later.

### Request Body
```json
{
  "user_id": "123"
}
```

Example Request using curl:
```bash
curl -X POST http://localhost:3000/task \
     -H "Content-Type: application/json" \
     -d '{"user_id":"123"}'
```
Example Responses:
- Success :  the task is accepted and processed immediately:
 ```json
 {
  "message": "Task is being processed"
}
```
- Rate Limit Exceeded: When the task is queued for processing later due to exceeding rate limits:
```json
{
  "message": "Rate limit exceeded: Max 20 tasks per minute"
}
```

## Task Logging
All completed tasks are logged in a file named task_log.txt, located in the root directory of the project. The log entries follow this format:
```php
<user_id> - task completed at <timestamp>
```
Example log entry:
```txt
123 - task completed at 1642095185670
```

## Code Structure
- cluster.js: Manages the cluster setup, spawning two worker processes for handling API requests.
- app.js: The main API file. It handles task submission, rate limiting, and queuing tasks in Redis.
- worker.js: A worker process that dequeues and processes tasks from Redis.
- task_log.txt: A file where task completion logs are stored.
- package.json: Contains project dependencies and scripts.
- README.md: Project documentation (this file).

## How It Works
1. Rate Limiting:
   - The API enforces a strict rate limit of 1 task per second and 20 tasks per minute for each user. If a user exceeds these limits, their requests are queued in Redis.
2. Task Queueing:
    - Tasks that exceed the rate limit are stored in Redis and are processed by a worker (worker.js). The worker dequeues tasks and processes them at 1 task per second for each user.
3. Cluster Resilience:
    - The application runs with two worker processes using Node.js’s cluster module. If one worker fails, the master process automatically restarts it to ensure high availability.
4. Task Logging:
    - Completed tasks are logged into task_log.txt with the user ID and timestamp, allowing you to track when each task was processed.