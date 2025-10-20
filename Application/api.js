//#region Imports / Variables / Constants
// don't change nothing here
require('dotenv').config();

const express = require('express');
const fsNotPromises = require('fs'); 
const fsPromisses = require('fs/promises');
const crypto = require('crypto');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

const app = express();
const fs = fsPromisses;
const fsSync = fsNotPromises;

const PORT = process.env.PORT;
const FILENAME = 'Database.json' 

const resJson = [{ICreate: "ApiTasky", Who: "SL MADE THIS"}, {NotifcationBy: "FCM", MadeBy: "Google"},{
    And: "We gonna mix that!", Productors: "SL + FCM"}, {FirstDay: "Today i'ts 20:28 01/09/2025", 
        Im: "Creating tasky api, but we least got the app v1 created!"}]


var hasInitialized = false;
var hashToSave;
var tasks;
app.use(express.json());

//#endregion

//#region Endpoints

app.get("/", (req,res) => {
    res.json(resJson);
});

app.get("/tasks", async (req,res) => {
    try{        
        tasks = await ReadAndReturnJson() || tasks;
        if (tasks != null || tasks != undefined)
        {
            return res.json(tasks).status(200);
        }        
        return res.status(400).json({error: "Error in tasks"});

    } catch (err) {
        res.status(500).json({error: "Unknown error"});
    }
});

app.get("/tasks/healthcheck", async (req,res) => {
    return res.sendStatus(200);
})

app.post("/tasks", async (req,res) => {
    try{
        tasks = await ReadAndReturnJson() || tasks;
        if (tasks != null || tasks != undefined){
            tasks.push(req.body);
            await fs.writeFile(FILENAME,JSON.stringify(tasks));   
            return res.json(tasks).status(200);
        }

        return res.status(400).json({error: "Error creating a new task"});

    }
    catch (err) {
        res.status(500).json({error: "Unknown error"});
    }
});

app.delete("/tasks", async (req,res) => {
    try {
        tasks = await ReadAndReturnJson() || tasks;
        if (tasks != null || tasks != undefined){
            var newTasks = tasks.filter(x => x.TaskId != Number(req.query.taskId));
            await fs.writeFile(FILENAME,JSON.stringify(newTasks));
            return res.status(200).send("OK");        
        }        

        return res.status(400).json({error: "Something goes wrong..."})

    } catch (err) {
        res.status(500).json({error: "Unknown error"});
    }
});

app.put("/tasks", async (req,res) => {
    try {
        tasks = await ReadAndReturnJson() || tasks;

        var toSave = tasks.filter(x => x.TaskId == Number(req.query.taskId));
        if(!toSave.length < 1)
        {
            toSave.TaskName = req.body.TaskName;
            toSave.TaskDesc = req.body.TaskDesc;
            toSave.HourTask = req.body.HourTask;
            toSave.NotifyTask = req.body.NotifyTask;
            toSave.TaskDone = req.body.TaskDone;
            tasks.forEach(async element => {
                if(element.TaskId == Number(req.query.taskId)){
                    element.TaskName = toSave.TaskName;
                    element.TaskDesc = toSave.TaskDesc;
                    element.HourTask = toSave.HourTask;
                    element.NotifyTask = toSave.NotifyTask;
                    element.TaskDone = toSave.TaskDone;
                    await fs.writeFile(FILENAME,JSON.stringify(tasks));
                    return res.status(200).send("OK");
                } 
            });        
        }
        else{
            return res.status(400).send("Error on parameter taskId");
        }
    }     
    catch (err) {
        
    }
})

//#endregion

//#region Telegram Endpoints

var states = {};

app.post("/api/telegram/webhook", async (req,res) => {
    if(req.body.message)
    {
        const chatId = req.body.message.chat.id;
        
        if(states[chatId]){
            const actualState = states[chatId];

            if(actualState.phase === 'name'){
                actualState.form['name'] = req.body.message.text;
                actualState.phase = 'desc';
                await bot.sendMessage(chatId, 'Agora envie a nova descrição');
                return res.sendStatus(200);
            }

            else if(actualState.phase === 'desc'){
                actualState.phase = 'date';
                actualState.form['desc'] = req.body.message.text;
                await bot.sendMessage(chatId, 'Agora envie a nova data: \nOBS:Mantenha nesse formato: (DD/MM/YYYY)');
                return res.sendStatus(200);

            }

            else if(actualState.phase === 'date'){
                actualState.phase = 'hour';
                actualState.form['date'] = req.body.message.text;
                await bot.sendMessage(chatId, 'Agora envie o novo horário de conclusão da tarefa: \nOBS:Mantenha nesse formato: (00:00)');
                return res.sendStatus(200);
            }
                        
            else if(actualState.phase === 'hour'){
                actualState.phase = 'notify';
                actualState.form['hour'] = req.body.message.text;
                await bot.sendMessage(chatId, 'Deseja notificar a mensagem? Envie Sim/Não ou (S/N)'); // melhorar isso para evitar respostas indevidas fazer checkbox
                return res.sendStatus(200);
            }

            else if(actualState.phase === 'notify'){
                actualState.phase = 'done';
                actualState.form['notify'] = req.body.message.text;
                await bot.sendMessage(chatId, 'Deseja salvar as alterações?'); // melhorar isso para evitar respostas indevidas fazer checkbox
                return res.sendStatus(200);
            }

            else if (actualState.phase === 'done' || req.body.message.text == ('SIM' || 'sim' || 's' || 'S')){
                await bot.sendMessage(chatId,'Atualizando tarefa...')            
                states = {};
                try {                    
                    await fetch(`http://localhost:${PORT}/edittelegram`,{
                        method: 'PUT',
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(actualState.form)
                    });
                }
                 catch (error) {
                    return res.sendStatus(500);
                }
                    return res.sendStatus(200);
            }
        }

        if (req.body.message.text === '/tarefas') 
        {
            try {
                const read = await fetch(`http://localhost:${PORT}/tasks`);
                const tasks = await read.json();                
                let message = "🗒️ *Suas tarefas:*\n\n";
                tasks.forEach(task => {
                    message += `📋 *Tarefa:* ${task.TaskName}\n`;
                    message += `📅 *Data:* ${new Date(task.HourTask).toLocaleDateString('pt-BR')}\n`;
                    message +=  task.TaskDone ? `✅ *Concluída:* Sim\n\n`  : `❌ *Concluída:* Não\n\n`; 
                });
                await bot.sendMessage(req.body.message.chat.id, message, { parse_mode: "Markdown" });
                res.sendStatus(200);
            } 
            catch (error) {
                console.error("Erro ao buscar tarefas:", error);
                await bot.sendMessage(chatId ,"❌ Erro ao carregar as tarefas.");
                res.sendStatus(500);
            }
        }

        else if (req.body.message.text === '/editar')
        {
            const read = await fetch(`http://localhost:${PORT}/tasks`);
            const tasks = await read.json();  
            const buttons = tasks.map(t => ([{
                text: t.TaskName,
                callback_data: `editar:${t.TaskId}`
            }]));

            bot.sendMessage(chatId, "Escolha qual tarefa deseja editar:", {
                reply_markup: {
                    inline_keyboard: buttons
                }
            });

            res.sendStatus(200);               
        }

        else if(req.body.message.text === '/deletar')
        {
            var message = 'Em desenvolvimento...';
            await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
            res.sendStatus(200);
        }
        else{
            await bot.sendMessage(chatId, 'Comando não identificado.', { parse_mode: "Markdown" });                
            res.sendStatus(200);
        }
    }

    if (req.body.callback_query)
    {
        const query = req.body.callback_query;
        const messageId = query.message.message_id;
        const [action, taskId] = query.data.split(':');
        if (action === 'editar'){
            await bot.deleteMessage(query.message.chat.id,messageId);
            const read = await fetch(`http://localhost:${PORT}/tasks`);
            const tasks = await read.json();  
            const taskFounded = tasks.find(t => t.TaskId === Number(taskId));
            await bot.sendMessage(query.message.chat.id, `📝 Editando tarefa: ${taskFounded.TaskName}\nEnvie o novo nome da tarefa:`);

            states[query.message.chat.id] = {
                phase : 'name',
                id: taskFounded.TaskId,
                form: {
                    "id":taskFounded.TaskId ,"name" : "", "desc" : "", "hour" : "","notify" : "", "date": ""
                }
            };
        }
        res.sendStatus(200);
    }
     
});

app.put("/edittelegram", async (req,res) => {
    tasks = await ReadAndReturnJson() || tasks;
    if (tasks != undefined)
    {
        var toUpdate = tasks.filter(x => x.TaskId == Number(req.body.id));
        if (toUpdate.length >= 1){
            var flag = ["sim", "s"].includes(req.body.notify?.toLowerCase()); 
            toUpdate.TaskName = req.body.name;
            toUpdate.TaskDesc = req.body.desc;
            toUpdate.HourTask = parseBrazilianDate(`${req.body.date} - ${req.body.hour}`);
            toUpdate.NotifyTask = flag;
            tasks.forEach(async el => {
                if(el.TaskId == Number(req.body.id)){
                    el.TaskName = toUpdate.TaskName;
                    el.TaskDesc = toUpdate.TaskDesc;
                    el.HourTask = toUpdate.HourTask;
                    el.NotifyTask = toUpdate.NotifyTask;
                    await fs.writeFile(FILENAME,JSON.stringify(tasks));
                    return res.status(200).send("OK");
                }
            })
            return res.status(500);
        }
        else
            return res.status(500);
    }     
    }
);


/*
    FAZER:
        1 - Resolver parse de datetime
        2 - Clean code pelo amor de Deus
        3 - Adicionar .env / separar api.js para api-telegram / api.js (rota para webhook chamar arquivo api-telegram(criar)) .
        4 - Entender lógica para fazer o delete.

 */


//#endregion

//#region Functions

async function startApi(){
    tasks = await ReadAndReturnJson();
}

async function ReadAndReturnJson(){
    try {
        if(fsSync.existsSync(FILENAME)){       
            var fileSize =  await fs.stat(FILENAME).then(x => x.size);
            if(fileSize > 0){
                var flag = await CompareFile();        
                if (flag){
                    const data = await fs.readFile(FILENAME,'utf8');
                    return JSON.parse(data);
                }
            }
            else{
                DataIntoDatabase();
            }
        }

        else
            DataIntoDatabase();
    } 

    catch (error) {
        throw error; 
    }
    
}

async function DataIntoDatabase(){
    console.log(`${FILENAME} don't exist, creating...`);
    const firstObject = [{ "TaskId": 1, "TaskName": "Tarefa generica", "NotifyTask" : false, "TaskDesc": "DescGenerica", "HourTask": "2080-12-21T00:00:00-04:00",                
        "IsEditingTask": false, "CanChange": true, "TaskDone" : false
    }]
    fs.writeFile(FILENAME,JSON.stringify(firstObject));        
    console.log(`${FILENAME} created.`);    
}

async function CompareFile(){
    const stream = fsSync.createReadStream(FILENAME);
    const hash = crypto.createHash('sha256');

    if(!hasInitialized){        
        const databaseHash = await new Promise((resolve, reject) => {
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });        

        hashToSave = databaseHash;
        hasInitialized = true;
        return true;        
    }

    else{
        var databaseHash = await new Promise((resolve, reject) => {
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error',reject);
        });
            
        if(hashToSave != databaseHash){
            console.log('Creating new hash');
            hashToSave = databaseHash;
            await HashLog();
            return true;
        }
        return false;
    }
}

async function HashLog(){
    const dateToLog = new Date();
    const logInfo = `${dateToLog.toLocaleDateString("pt-br")} at ${dateToLog.toLocaleTimeString("pt-br")}`;
    const logToWrite = `Hash created: ${hashToSave} in ${logInfo}\n`;
    await fs.appendFile('HashLog.txt', logToWrite);
}

function parseBrazilianDate(str) {
  const [datePart, timePart] = str.split(" - ");
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split("/").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  if (
    !day || !month || !year ||
    hours === undefined || minutes === undefined
  ) return null;

  const date = new Date(year, month - 1, day, hours, minutes);

  const iso = date.toISOString();

  const offsetMin = date.getTimezoneOffset();
  const offsetHr = Math.floor(Math.abs(offsetMin) / 60)
    .toString()
    .padStart(2, "0");
  const offsetMn = (Math.abs(offsetMin) % 60)
    .toString()
    .padStart(2, "0");
  const sign = offsetMin > 0 ? "-" : "+";

  const localISO = iso.slice(0, 19) + `${sign}${offsetHr}:${offsetMn}`;
  return localISO;
}

//#endregion

app.listen(PORT, () => {
    startApi();
    console.log(`Api running on port ${PORT}\n`);    
});
