const PgDatabase = require('../data/pg.js');

//#region Tasks

async function GetAllTasks(){
    try {
        const result = await PgDatabase.query("SELECT * FROM TASKS");
        return result.rows;
    } 
    catch (error) {
        console.error("Error in Get All Tasks Repository:",error);
        return null;
    }

}

async function GetAllTasksFromUser(userId){
    try {
        const userFromDb = await GetOrCreateUser(userId);
        const result = await PgDatabase.query("SELECT * FROM TASKS WHERE user_id = $1",[userFromDb.id]);
        return result.rows;
    } 
    catch (error) {
        console.error("Error in Get All Tasks From User Repository:",error);
        return null;
    }
}

async function CreateTask(data){
    try {
        const userFromDb = await GetOrCreateUser(data.id);
        const result = await PgDatabase.query(
            `INSERT INTO public.tasks 
             (user_id, "TaskName", "TaskDesc", "HourTask", "NotifyTask", "TaskDone", "CanChange", "IsEditingTask")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [ userFromDb.id, data.body.TaskName, data.body.TaskDesc, data.body.HourTask, data.body.NotifyTask, data.body.TaskDone, data.body.CanChange, data.body.IsEditingTask]);
        return result.rowCount > 0;              
    } 
    catch (error) {
        console.error("Error in Create Task Repository:",error);
        return null;
    }
}

async function DeleteTask(taskId,userId){
    try {
        const userFromDb = await GetOrCreateUser(userId);
        const result = await PgDatabase.query(`DELETE FROM public.tasks WHERE tasks.user_id = $1 AND tasks."TaskId" = $2`,[userFromDb.id,taskId]);
        // DELETE FROM public.tasks WHERE tasks.user_id = '1' AND tasks."TaskId" = 10 
        return result.rowCount > 0;
        // const result = await PgDatabase.query(`DELETE FROM TASKS WHERE tasks."TaskId" = $1`,[taskId]);
        // return result.rowCount > 0;
    } 
    catch (error) {
        console.error("Error in Delete Task Repository:",error);
        return null;
    }
}

async function EditTask(params,chatId){
    try 
    {
        const taskId = params.TaskId;
        const userId = await GetOrCreateUser(chatId);
        let query = "UPDATE tasks SET";
        for (const [key,value] of Object.entries(params)){
            if(key.includes("TaskId"))
                continue;
            else if(key.includes("TaskDone")){
                query += `"${key}" = ${value},`
                continue;
            }
            else if(key.includes("NotifyTask")){
                query += `"${key}" = ${value}`
                continue;
            } 
            query += ` "${key}" = '${value}',`
        } 

        const result = await PgDatabase.query(`${query} WHERE tasks."TaskId" = $1 AND tasks.user_id = $2`,[taskId,userId.id])
        return result.rowCount > 0; 
        
    }
    catch (error) {
        console.log("Error in Edit Task Repository:",error);
        return null;        
    }    
}


//#endregion

//#region Notifications

async function GetAllNotifications(){
    try {
        const result = await PgDatabase.query("SELECT * FROM TASK_NOTIFICATIONS");
        return result.rows;
    } 
    catch (error) {
        console.error("Error in Get All Notifications Repository:",error);
        return null;         
    }

}

async function GetNotificationsFromTask(taskId){
    try {
        const result = await PgDatabase.query("SELECT * FROM TASK_NOTIFICATIONS WHERE task_id = $1",[taskId]);
        return result.rows;
    } 
    catch (error) {
        console.error("Error in Get Notifications From Task Repository:",error);
        return null;            
    }

}

//#endregion

//#region Users

async function GetOrCreateUser(chatId){
    try
    {
        let getUser = await PgDatabase.query("SELECT * FROM USERS WHERE chat_id = $1",[chatId]);
        if(getUser.rowCount > 0){
            return getUser.rows[0];        
        }
        else
        {
            let createUser = await PgDatabase.query("INSERT INTO USERS (chat_id) VALUES ($1)",[chatId]);
            
            if(createUser.rowCount > 0){
                let getUser = await PgDatabase.query("SELECT * FROM USERS WHERE chat_id = $1",[chatId]);
                return getUser.rows[0];
            }
        }
    }
    catch(error){
        console.error("Error in Get Or Create User Repository:",error);
        return null;
    }
}


async function GetAllUsers(){
    try {
        const result = await PgDatabase.query("SELECT * FROM USERS");
        return result.rows;        
    } 
    catch (error) {
        console.error("Error in Get All Users Repository:",error);
        return null;           
    }
}

//#endregion

module.exports = {
    CreateTask,
    EditTask,
    GetAllTasks,
    GetAllTasksFromUser,
    DeleteTask,
    GetAllNotifications,
    GetNotificationsFromTask,
    GetAllUsers,
    GetOrCreateUser
}