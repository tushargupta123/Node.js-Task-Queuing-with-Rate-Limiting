const cluster = require('cluster');
const numCPUs = 2; // Setting up 2 replicas

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart a new worker
  });
} else {
  require('./app'); // Start the application in a worker process
}
