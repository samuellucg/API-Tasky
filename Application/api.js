//#region Imports / Variables / Constants
// don't change nothing here
require('dotenv').config();

const express = require('express');
const token = process.env.TELEGRAM_BOT_TOKEN;
const app = express();
const taskRoutes = require('../routes/tasks.js');
const PORT = process.env.PORT;
const taskService = require('../services/taskService.js');
const TelegramHandler = require('../bot/telegramWebhook.js');
const PgDatabase = require('../data/pg.js');

// const resJson = [{ICreate: "ApiTasky", Who: "SL MADE THIS"}, {NotifcationBy: "FCM", MadeBy: "Google"},{
//     And: "We gonna mix that!", Productors: "SL + FCM"}, {FirstDay: "Today i'ts 20:28 01/09/2025", 
//         Im: "Creating tasky api, but we least got the app v1 created!"}]

app.use(express.json());

//#endregion

const telHand = new TelegramHandler(app,token,PORT)

app.use('/tasks',taskRoutes);

app.post("/api/telegram/webhook", telHand.routesTelegram);

// setInterval(() => {
//     telHand.checkNotification();
// }, 60000);

// setInterval(() => {
//   testConnection();
// }, 5000);

app.listen(PORT, () => {
    taskService.startApi();
    console.log(`Api running on port ${PORT}\n`);    
    console.log(token);
});

// async function testConnection() { 
//   const result = await PgDatabase.query('SELECT * from tasks');
//   // console.log(result.rows.length > 0)
//   console.log(result.rows); // Toda tabela
//   // console.log(result.rowCount);
//   // console.log(result.oid);
//   // console.log(result.rows[0]); // 
// }
