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
        const result = await PgDatabase.query("SELECT * FROM TASKS WHERE user_id = $1",[userId]);
        return result.rows;
    } 
    catch (error) {
        console.error("Error in Get All Tasks From User Repository:",error);
        return null;
    }
}

async function CreateTask(data){
    try {
        const result = await PgDatabase.query("INSERT INTO TASKS VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",[data.TaskId,1,data.TaskName,data.TaskDesc,data.HourTask,data.NotifyTask,data.TaskDone,data.CanChange,data.IsEditingTask])
        return result.rowCount > 0;        
    } 
    catch (error) {
        console.error("Error in Create Task Repository:",error);
        return null;
    }
}

async function DeleteTask(taskId){
    try {
        const result = await PgDatabase.query(`DELETE FROM TASKS WHERE tasks."TaskId" = $1`,[taskId]);
        return result.rowCount > 0;        
    } 
    catch (error) {
        console.error("Error in Delete Task Repository:",error);
        return null;
    }
}

async function EditTask(params){
    try 
    {
        const taskId = params.TaskId;
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

        const result = await PgDatabase.query(`${query} WHERE tasks."TaskId" = $1`,[taskId])
        return result.rowCount > 0; 
        
    }
    catch (error) {
        console.error("Error in Edit Task Repository:",error);
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
    GetAllUsers
}