// const { Queue } = require('bullmq');
// const {Redis} = require('ioredis');

// const connection = new Redis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

// const notifyQueue = new Queue('notify-task',null,{connection});

// async function addJobs(){
//     await notifyQueue.add('default-job-name', { key: 'default-value'});
// }

// async function createJob(key,value){
//     await notifyQueue.add(key,value);
// }

// module.exports = {
//     createJob,
//     addJobs
// }
