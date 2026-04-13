const { Worker, Queue } = require('bullmq');
const { Redis } = require('ioredis');

const connection = new Redis({ maxRetriesPerRequest: null });

const notifyQueue = new Queue('notify-task', { connection });

async function createJob(key, value) {
    await notifyQueue.add(key, value);
}

const worker = new Worker(
    'notify-task',
    async (job) => {
        console.log(`Valor em notify task:`, job.data);
    },
    { connection }
);

worker.on('completed', (job) => {
    console.log(`${job.id} ${job.data} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}!`);
});

async function test() {
    // Job executado imediatamente
    await notifyQueue.add('urgente', { msg: 'Agora!' });

    // Job executado após 5 segundos
    await notifyQueue.add('agendado', { msg: 'Daqui 5s!' }, { delay: 5000 });

    // Job executado após 10 segundos
    await notifyQueue.add('agendado', { msg: 'Daqui 10s!' }, { delay: 10000 });
    
    await notifyQueue.add('Teste', { msg: 'Levar lixo' }, { delay: 60000 });

    console.log(`⏰ Jobs criados em: ${new Date().toLocaleTimeString()}`);
}

test();

//#region  Ui

const express = require('express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [new BullMQAdapter(notifyQueue)],
    serverAdapter,
});

const app = express();
app.use('/admin/queues', serverAdapter.getRouter());
app.listen(3000, () => {
    console.log('🔗 Bull Board em: http://localhost:3000/admin/queues');
});
//#endregion


// createJob('default-job-name', { key: 'default-value' });
// createJob('afazer', {key: 'levar-lixo'});