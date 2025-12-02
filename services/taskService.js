const fsNotPromises = require('fs'); 
const fsPromisses = require('fs/promises');
const crypto = require('crypto');
const fs = fsPromisses;
const fsSync = fsNotPromises;
const path = require('path');
const { start } = require('repl');
const OLD_FILENAME = '../Data/Database.json' 
const FILENAME = path.join(__dirname, '../data/Database.json');
var hasInitialized = false;
var hashToSave;
var tasksGlobal;
console.log('OLD FILE PATH:',OLD_FILENAME);
console.log('ACTUAL FILE PATH:',FILENAME);

const resJson = [{ICreate: "ApiTasky", Who: "SL MADE THIS"}, {NotifcationBy: "FCM", MadeBy: "Google"},{
    And: "We gonna mix that!", Productors: "SL + FCM"}, {FirstDay: "Today i'ts 20:28 01/09/2025", 
        Im: "Creating tasky api, but we least got the app v1 created!"}]

async function CreateNewTask(req){
    try 
    {    
        var tasks = await ReadAndReturnJson() || tasksGlobal;
        // console.log("after tasks");
        // console.log("AFTER REQ TO CREATE:",tasks);
        if (tasks){
            console.log("Tasks antes do push:", JSON.stringify(tasks, null, 2));
        
            tasks.push(req.body);
            console.log("AFTER PUSH TO CREATE:",tasks);
            await fs.writeFile(FILENAME,JSON.stringify(tasks));   
            return tasks;
        }

        console.log("aquiiui")
        return null;
    } 
    
    catch (error) {
        console.log('deu ruim irmao')
        return undefined;        
    }

}

async function UpdateTask(req){
    try 
    {                
        var tasks = await ReadAndReturnJson() || tasksGlobal;
        tasks.filter(x => x!== null && x !== undefined);  
        var toSave = tasks.filter(x => x.TaskId == Number(req.query.taskId))[0]; // trocar por find
        // console.log("to save val",toSave);
        // console.log("legn:",toSave.length);
        if(toSave)
        {
            toSave.TaskName = req.body.TaskName;
            toSave.TaskDesc = req.body.TaskDesc;
            toSave.HourTask = req.body.HourTask;
            toSave.NotifyTask = req.body.NotifyTask;
            toSave.TaskDone = req.body.TaskDone;

            for (const element of tasks) {
                if(element.TaskId == Number(req.query.taskId))
                {
                    // console.log("HEREEEE");
                    element.TaskName = toSave.TaskName;
                    // console.log("element:",element);
                    // console.log("new data:", toSave);
                    element.TaskDesc = toSave.TaskDesc;
                    element.HourTask = toSave.HourTask;
                    element.NotifyTask = toSave.NotifyTask;
                    element.TaskDone = toSave.TaskDone;
                    // console.log('going to return');
                    await fs.writeFile(FILENAME,JSON.stringify(tasks));
                    // console.log('returned');
                    return true;
                }
            }

            /*
            forEach, map, filter → não “esperam” Promises.

            for...of, while, etc. → respeitam await e mantêm a sequência.

            return dentro de um forEach não sai da função principal, só da callback.
            */
        }
        else{
            return false;
        }
    } 

    catch (error) {
        return undefined;    
    }
}

async function DeleteTask(req){
    try 
    {
        var tasks = await ReadAndReturnJson() || tasksGlobal;
        
        if (tasks){
            // console.log('on if delete');
            var newTasks = tasks.filter(x => x.TaskId != Number(req.query.taskId));
            tasksGlobal = newTasks; // atualiza cache global antes de ser feito o delete.
            // console.log('newTasks val:',newTasks);
            await fs.writeFile(FILENAME,JSON.stringify(newTasks));
            // await new Promise(res => setTimeout(res, 100));
            return true
        }

        else{
            return false
        }
    } 
    catch (error) 
    {
        return undefined;
    }
}

async function GetTasks(){
    try
    {
        var tasks = await ReadAndReturnJson() || tasksGlobal;    
        if (tasks){        
            console.log('Get Tasks Result:',tasks);
            return tasks;
        }
        else{
            return false;
        }
    }
    catch (error)
    {
        return undefined;
    }
}

async function getTaskId() {
    try 
    {
        let tasks = await ReadAndReturnJson() || tasksGlobal;

        if(!tasks.length) return 1;

        const maxId = Math.max(...tasks.map(t => t.taskId));
        // let id = tasks.length += 1;
        return maxId +=1;
    } 
    catch (error)
    {
        console.error("error",error);
    }
}

async function ReadAndReturnJson(){
    try {
        if(fsSync.existsSync(FILENAME)){   
            var fileSize =  await fs.stat(FILENAME).then(x => x.size);
            // console.log("after filesize", fileSize);
            if(fileSize > 0){
                // console.log("on if filesize");
                var flag = await CompareFile();
                // console.log("after flag");
                if (flag){             
                    // console.log("on flag");                         
                    const data = await fs.readFile(FILENAME,'utf8');
                    // console.log("going to return");
                    return JSON.parse(data);
                }                
            }
            else{                
                await DataIntoDatabase();
            }
        }

        else
            await DataIntoDatabase();
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
    await fs.writeFile(FILENAME,JSON.stringify(firstObject));        
    console.log(`${FILENAME} created.`);    
}

async function CompareFile(){
    const stream = fsSync.createReadStream(FILENAME);
    const hash = crypto.createHash('sha256');
    // console.log("on compare file function");
    if(!hasInitialized){        
        // console.log("on !hasinitialized");
        const databaseHash = await new Promise((resolve, reject) => {
            // console.log("inside hash");
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });        

        hashToSave = databaseHash;
        hasInitialized = true;
        // console.log("going to return on compare file function");
        return true;        
    }

    else{
        // console.log("on compare file else");
        var databaseHash = await new Promise((resolve, reject) => {
            // console.log("on database hash in else compare function");
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error',reject);
        });

        // console.log("database hash compare function",databaseHash);
        // console.log("hashtosave",hashToSave);
            
        if(hashToSave != databaseHash){
            // console.log('Creating new hash');
            hashToSave = databaseHash;
            await HashLog();
            return true;
        }
        // console.log("not different");
        return false;
    }
}

async function HashLog(){
    const dateToLog = new Date();
    const logInfo = `${dateToLog.toLocaleDateString("pt-br")} at ${dateToLog.toLocaleTimeString("pt-br")}`;
    const logToWrite = `Hash created: ${hashToSave} in ${logInfo}\n`;
    await fs.appendFile('HashLog.txt', logToWrite);
}

async function startApi(){
    console.log("global seted");
    tasksGlobal = await ReadAndReturnJson();
}

module.exports = 
{
    GetTasks,
    CreateNewTask,
    UpdateTask,
    DeleteTask,
    startApi,
    getTaskId
};