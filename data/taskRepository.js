const PgDatabase = require('../data/pg.js');

//#region Tasks

async function GetAllTasks(){
    const result = await PgDatabase.query("SELECT * FROM TASKS");
    return result.rows;
}

async function GetAllTasksFromUser(userId){
    const result = await PgDatabase.query("SELECT * FROM TASKS WHERE user_id = $1",[userId]);
    return result.rows;
}

async function DeleteTask(taskId){
    const result = await PgDatabase.query("DELETE FROM TASKS WHERE id = $1 RETURNING *",[taskId]);
    return result.rows;
}

//#endregion

//#region Notifications

async function GetAllNotifications(){
    const result = await PgDatabase.query("SELECT * FROM TASK_NOTIFICATIONS");
    return result.rows;
}

async function GetNotificationsFromTask(taskId){
    const result = await PgDatabase.query("SELECT * FROM TASK_NOTIFICATIONS WHERE task_id = $1",[taskId]);
    return result.rows;
}

//#endregion

//#region Users

async function GetAllUsers(){
    const result = await PgDatabase.query("SELECT * FROM USERS");
    return result.rows;
}

//#endregion

module.exports = {
    GetAllTasks,
    GetAllTasksFromUser,
    DeleteTask,
    GetAllNotifications,
    GetNotificationsFromTask,
    GetAllUsers
}