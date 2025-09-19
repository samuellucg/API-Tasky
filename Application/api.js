//#region Imports / Variables / Constants
// don't change nothing here

const express = require('express');
const fsNotPromises = require('fs'); 
const fsPromisses = require('fs/promises');
const crypto = require('crypto');
const { FILE } = require('dns');

const app = express();
const fs = fsPromisses;
const fsSync = fsNotPromises;

const PORT = 3000;
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
            
            tasks.forEach(async element => {
                if(element.TaskId == Number(req.query.taskId)){
                    element.TaskName = toSave.TaskName;
                    element.TaskDesc = toSave.TaskDesc;
                    element.HourTask = toSave.HourTask;
                    element.NotifyTask = toSave.NotifyTask;
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

//#region Functions

async function startApi(){
    tasks = await ReadAndReturnJson();
}

async function ReadAndReturnJson(){
    try {
        // BUG WHEN database.json it's empty...
        if(fsSync.existsSync(FILENAME)){        
            var flag = await CompareFile();        
            if (flag){
                const data = await fs.readFile(FILENAME,'utf8');
                return JSON.parse(data);
            }
        }

        else{            
            console.log(`${FILENAME} don't exist, creating...`);
            const firstObject = [{ "TaskId": 1, "TaskName": "Tarefa generica", "NotifyTask" : false, "TaskDesc": "DescGenerica", "HourTask": "2080-12-21T00:00:00-04:00",                
                "IsEditingTask": false, "CanChange": true
            }];

            fs.writeFile(FILENAME,JSON.stringify(firstObject));        
            console.log(`${FILENAME} created.`);
        }
    } 

    catch (error) {
        throw error; 
    }
    
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

//#endregion

app.listen(PORT, () => {
    startApi();
    console.log(`Api running on port ${PORT}\n`);    
});
