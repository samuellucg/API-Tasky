const fsNotPromises = require('fs'); 
const fsPromisses = require('fs/promises');
const crypto = require('crypto');
const fs = fsPromisses;
const fsSync = fsNotPromises;
const path = require('path');
const { start } = require('repl');
const OLD_FILENAME = '../Data/Database.json' 
const FILENAME = path.join(__dirname, '../data/Database.json');
const DATA_DIR = path.dirname(FILENAME);
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
        if (tasks){ 
            tasks.push(req.body);
            await fs.writeFile(FILENAME,JSON.stringify(tasks));   
            return tasks;
        }

        return null;
    } 
    
    catch (error) {
        console.log('Error on CreateNewTask function:',error);
        return undefined;        
    }

}

async function UpdateTask(req){
    try 
    {                
        var tasks = await ReadAndReturnJson() || tasksGlobal;
        var toSave = tasks.filter(x => x.TaskId == Number(req.query.taskId))[0];
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
                    element.TaskName = toSave.TaskName;
                    element.TaskDesc = toSave.TaskDesc;
                    element.HourTask = toSave.HourTask;
                    element.NotifyTask = toSave.NotifyTask;
                    element.TaskDone = toSave.TaskDone;
                    await fs.writeFile(FILENAME,JSON.stringify(tasks));
                    return true;
                }
            }
        }
        else{
            return false;
        }
    } 

    catch (error) {
        console.log('Error on UpdateTask function:', error);
        return undefined;    
    }
}

async function DeleteTask(req){
    try 
    {
        var tasks = await ReadAndReturnJson() || tasksGlobal;
        
        if (tasks){
            var newTasks = tasks.filter(x => x.TaskId != Number(req.query.taskId));
            tasksGlobal = newTasks;
            await fs.writeFile(FILENAME,JSON.stringify(newTasks));
            return true
        }

        else{
            return false
        }
    } 
    catch (error) 
    {
        console.log('Error on DeleteTask function:', error);
        return undefined;
    }
}

async function GetTasks(){
    try
    {
        var tasks = await ReadAndReturnJson() || tasksGlobal; 
        console.log('tasks on getTasks:', tasks); 
        console.log('task global:', tasksGlobal); 
        if (tasks){        
            return tasks;
        }
        else{
            return false;
        }
    }
    catch (error)
    {
        console.log("Error on GetTasks:",error);
        return undefined;
    }
}

async function getTaskId() {
    try 
    {
        let tasks = await ReadAndReturnJson() || tasksGlobal;
        if(!tasks.length) return 1;
        let maxId = Math.max(...tasks.map(t => t.TaskId));
        console.log(maxId);
        return maxId +=1;
    } 
    catch (error)
    {
        console.log("Error getTaskId:",error);
        return false; // tratar
    }
}

async function ReadAndReturnJson(){
    try {
        if(fsSync.existsSync(FILENAME)){   
            console.log('on ReadAndReturnJson fileExist');
            var fileSize =  await fs.stat(FILENAME).then(x => x.size);
            if(fileSize > 0){
                console.log('Filesize > 0');
                var flag = await CompareFile();
                if (flag){                                
                    console.log('flag is true');
                    const data = await fs.readFile(FILENAME,'utf8');
                    tasksGlobal = JSON.parse(data);
                    return tasksGlobal;
                }  
                console.log("tasks global if flag != true:\n",tasksGlobal);
                return tasksGlobal;              
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

    await fs.mkdir(DATA_DIR, {recursive: true});

    // const firstObject = [{ "TaskId": 1, "TaskName": "Tarefa generica", "NotifyTask" : false, "TaskDesc": "DescGenerica", "HourTask": "2080-12-21T00:00:00-04:00",                
    //     "IsEditingTask": false, "CanChange": true, "TaskDone" : false
    // }]
    const firstObject = [{ "TaskId": 1, "TaskName": "Tarefa generica", "NotifyTask" : false, "TaskDesc": "DescGenerica", "HourTask": "2080-12-21T00:00:00-04:00",                
        "IsEditingTask": false, "CanChange": true, "TaskDone" : false, "notifications" : {"sent15min" : false, "sent5min" : false}
    }]
    await fs.writeFile(FILENAME,JSON.stringify(firstObject));        
    console.log(`${FILENAME} created.`);    
}

// async function CompareFile2(){
//     const stream = fsSync.createReadStream(FILENAME);
//     const hash = crypto.createHash('sha256');
//     if(!hasInitialized){        
//         const databaseHash = await new Promise((resolve, reject) => {
//             stream.on('data', chunk => hash.update(chunk));
//             stream.on('end', () => resolve(hash.digest('hex')));
//             stream.on('error', reject);
//         });        

//         hashToSave = databaseHash;
//         hasInitialized = true;
//         return true;        
//     }

//     else{
//         var databaseHash = await new Promise((resolve, reject) => {
//             stream.on('data', chunk => hash.update(chunk));
//             stream.on('end', () => resolve(hash.digest('hex')));
//             stream.on('error',reject);
//         });
            
//         if(hashToSave != databaseHash){
//             hashToSave = databaseHash;
//             await HashLog();
//             return true;
//         }

//         return false;
//     }
// }

async function CompareFile() {
    const hash = crypto.createHash('sha256');
    const databaseHash = await new Promise((resolve, reject) => {
        const stream = fsSync.createReadStream(FILENAME);
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });        
    
    if(!hasInitialized){        
        hashToSave = databaseHash;
        hasInitialized = true;
        return true;        
    }

    if(hashToSave !== databaseHash){
        hashToSave = databaseHash;
        await HashLog();
        return true;
    }

    return false;
}

async function checkDateAndHour(type,field){
    switch (type) {
        case 'hour':
            return await validateHour(field);

        case 'date':
            return await validateDate(field);

        default:
            return undefined;
    }
}

async function validateHour(hourFromUser){
    try 
    {
        hourFromUser = hourFromUser.trim();
        const flagColon = hourFromUser.includes(':');
        if (hourFromUser.length == 5 && flagColon){
            const [minutes,seconds] = hourFromUser.split(':');
            console.log('min:',minutes);
            console.log('sec:',seconds);

            if (minutes >= 0 && minutes <= 23 && seconds >= 0 && seconds <= 59){
                return true;
            }
            return false;
        }
        return false;

    } 
    catch (error) 
    {
        console.log('Error on validateHour:',error);
        return undefined;
    }
}

async function validateDate(dataFromUser){
    try
    {
        dataFromUser = dataFromUser.trim();
        const flagBar1 = dataFromUser.includes('/',2);
        const flagBar2 = dataFromUser.includes('/',5);
        if (dataFromUser.length != 10 && flagBar1, flagBar2){
            const [day,month,year] = dataFromUser.split('/');
            const validateDate = new Date(Number(year),Number(month-1),Number(day));        
            if (validateDate instanceof Date && validateDate != 'Invalid Date'){
                return true;
            }
            return false;
        }
        return false;
    } 
    catch (error) 
    {
        console.log('Error on validateDate:',error);
        return undefined;
    }
}

async function checkNotifcationsOnTasks(){
    const now = new Date();
    var tasksToNotify = [];
    var tasks = await ReadAndReturnJson() || tasksGlobal;    
    if(!tasks.length) return [];
    var tasksFiltered = tasks.filter(x => x. TaskDone !== true);
    if (!tasksFiltered.length) return [];

    for (var task of tasksFiltered) {
        var dateTask = new Date(task.HourTask)
        const diffMs = dateTask - now;
        const diffMin = Math.floor(diffMs / 1000 / 60);

        // console.log('dif min:',diffMin);

        if (diffMin > 0){        
            if(diffMin == 15 && !task.Notifications.Sent15min){
                tasksToNotify.push({task, type: '15min'});
                task.Notifications.Sent15min = true;
            }

            else if (diffMin == 5 && !task.Notifications.Sent5min){
                tasksToNotify.push({task, type: '5min'});
                task.Notifications.Sent5min = true;
            }

            else if (diffMin == 0 && task.Notifications.Sent15min && task.Notifications.Sent5min)
                task.TaskDone = true;
        }
    }

    await fs.writeFile(FILENAME,JSON.stringify(tasks));
    return tasksToNotify;
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
    getTaskId,
    checkDateAndHour,
    checkNotifcationsOnTasks
};