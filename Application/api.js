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

// const resJson = [{ICreate: "ApiTasky", Who: "SL MADE THIS"}, {NotifcationBy: "FCM", MadeBy: "Google"},{
//     And: "We gonna mix that!", Productors: "SL + FCM"}, {FirstDay: "Today i'ts 20:28 01/09/2025", 
//         Im: "Creating tasky api, but we least got the app v1 created!"}]

app.use(express.json());

//#endregion

const telHand = new TelegramHandler(app,token,PORT)

app.use('/tasks',taskRoutes);

app.post("/api/telegram/webhook", telHand.routesTelegram);

app.listen(PORT, () => {
    taskService.startApi();
    console.log(`Api running on port ${PORT}\n`);    
    console.log(token);
});
