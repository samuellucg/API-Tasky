const services = require('../services/taskService');
const fsPromisses = require('fs/promises');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const fs = fsPromisses;
let states = {};
let errorCounter = 0;
let app;
let bot;
let port;
let chatId;
const OLD_FILENAME = '../Data/Database.json' 
const FILENAME = path.join(__dirname, '../data/Database.json');

class TelegramHandler {
  constructor(_app,_token,_port) {
    app = _app;
    this.bot = new TelegramBot(_token);
    port = _port;
    this.routesTelegram = this.routesTelegram.bind(this);
    this.editTelegram = this.editTelegram.bind(this);
    this.parseBrazilianDate = this.parseBrazilianDate.bind(this);
    // se precisar, injeta dependências aqui
  }

async routesTelegram(req,res){
    // console.log(req.body);
    if(req.body.message)
    {
        chatId = req.body.message.chat.id;
        
        if(states[chatId]){
            const actualState = states[chatId];

            switch (actualState.phase) {
                case 'name':
                    actualState.form['name'] = req.body.message.text;
                    actualState.phase = 'desc';
                    await this.bot.sendMessage(chatId, 'Agora envie a nova descrição');
                    return res.sendStatus(200);

                case 'desc':
                    actualState.phase = 'date';
                    actualState.form['desc'] = req.body.message.text;
                    await this.bot.sendMessage(chatId, 'Agora envie a nova data: \nOBS:Mantenha nesse formato: (DD/MM/YYYY)');
                    return res.sendStatus(200);

                case 'date':
                    if (errorCounter === 5){
                        delete states[chatId];
                        await this.bot.sendMessage(chatId, 'Como não está sendo possível criar sua tarefa, tente novamente mais tarde');
                        errorCounter = 0;
                        return res.sendStatus(200);
                    }

                    var check = services.checkDateAndHour('date',req.body.message.text);
                    if (check){
                        actualState.phase = 'hour';
                        actualState.form['date'] = req.body.message.text;
                        await this.bot.sendMessage(chatId, 'Agora envie o novo horário de conclusão da tarefa: \nOBS:Mantenha nesse formato: (00:00)');
                        errorCounter = 0;
                        return res.sendStatus(200);
                    }                    
                    await this.bot.sendMessage(chatId, 'Houve um erro ao definir sua data, por favor envie novamente nesse formato\n(DD/MM/YYYY)');
                    errorCounter+=1;
                    return res.sendStatus(200);

                case 'hour':
                    if(errorCounter == 5){
                        delete states[chatId];
                        await this.bot.sendMessage(chatId, 'Como não está sendo possível criar sua tarefa, tente novamente mais tarde');
                        return res.sendStatus(200);
                    }

                    var check = await services.checkDateAndHour('hour',req.body.message.text);
                    
                    if(check){
                        actualState.phase = 'notify';
                        actualState.form['hour'] = req.body.message.text;
                        await this.bot.sendMessage(chatId, 'Deseja notificar a tarefa? Envie Sim/Não ou (S/N) \n\nOBS: Qualquer mensagem diferente disso não irá notificar a mensagem')
                        return res.sendStatus(200);
                    }

                    await this.bot.sendMessage(chatId, 'Houve um erro ao definir seu horário, por favor envie novamente nesse formato: 00:00)');
                    errorCounter+=1;
                    console.log('errorCounter:',errorCounter);
                    return res.sendStatus(200);
                    
                case 'notify':
                    var text = req.body.message.text.toUpperCase()
                    var result = (text === 'S' || text === 'SIM');
                    actualState.form['notify'] = result;
                    actualState.phase = 'done';

                case 'done':
                    await this.bot.sendMessage(chatId,'Atualizando tarefa...');

                    var returnStatus = await this.editTelegram(actualState.form);
                    if (returnStatus != undefined && returnStatus != false){
                        var message = "🗒️ *Sua tarefa:*\n\n";
                        message += `📋 *Tarefa:* ${returnStatus.TaskName}\n`;
                        message += `📝 *Descrição:* ${returnStatus.TaskDesc}\n`;
                        message += `📅 *Data:* ${new Date(returnStatus.HourTask).toLocaleDateString('pt-BR')}\n`;
                        await this.bot.sendMessage(chatId, message, {parse_mode: 'Markdown'});
                        delete states[chatId];
                        errorCounter = 0;
                        return res.sendStatus(200);
                    }
                    delete states[chatId];
                    errorCounter = 0;
                    return res.sendStatus(200);  

                // A partir daqui será cases para criação

                case 'nameCreate':
                    actualState.phase = 'descCreate';
                    actualState.form['TaskName'] = req.body.message.text;
                    await this.bot.sendMessage(chatId, 'Envie a descrição da tarefa:')
                    return res.sendStatus(200);
                    
                case 'descCreate':
                    actualState.phase = 'hourCreate';
                    actualState.form['TaskDesc'] = req.body.message.text;
                    await this.bot.sendMessage(chatId, 'Envie o horário da tarefa: \nOBS:Mantenha nesse formato: (00:00)')
                    return res.sendStatus(200); 

                case 'hourCreate':
                    if(errorCounter == 5){
                        delete states[chatId];
                        await this.bot.sendMessage(chatId, 'Como não está sendo possível criar sua tarefa, tente novamente mais tarde');
                        errorCounter = 0;
                        return res.sendStatus(200);
                    }

                    var check = await services.checkDateAndHour('hour',req.body.message.text);

                    if(check){                                                
                        actualState.phase = 'dateCreate';
                        actualState.form['hour'] = req.body.message.text;
                        await this.bot.sendMessage(chatId, 'Envie a data: \nOBS:Mantenha nesse formato: (DD/MM/YYYY)')
                        errorCounter = 0;
                        return res.sendStatus(200);               
                    }

                    await this.bot.sendMessage(chatId, 'Houve um erro ao definir seu horário, por favor envie novamente nesse formato: 00:00)');
                    errorCounter+=1;
                    console.log('errorCounter:',errorCounter);
                    return res.sendStatus(200);

                case 'dateCreate':
                    if (errorCounter === 5){
                        delete states[chatId];
                        await this.bot.sendMessage(chatId, 'Como não está sendo possível criar sua tarefa, tente novamente mais tarde');
                        errorCounter = 0;
                        return res.sendStatus(200);
                    }
                    var check = await services.checkDateAndHour('date',req.body.message.text);

                    if(check){
                        actualState.phase = 'notifyCreate';
                        actualState.form['date'] = req.body.message.text;
                        actualState.form['HourTask'] = this.parseBrazilianDate(`${actualState.form['date']} - ${actualState.form['hour']}`)
                        await this.bot.sendMessage(chatId, 'Deseja notificar a tarefa? Envie Sim/Não ou (S/N) \n\nOBS: Qualquer mensagem diferente disso não irá notificar a mensagem')
                        errorCounter = 0;
                        return res.sendStatus(200);
                    }

                    await this.bot.sendMessage(chatId, 'Houve um erro ao definir sua data, por favor envie novamente nesse formato \n(DD/MM/YYYY)');
                    errorCounter+=1;
                    console.log('errorCounter:',errorCounter);
                    return res.sendStatus(200);

                case 'notifyCreate':
                    var text = req.body.message.text.toUpperCase()
                    var result = (text === 'S' || text === 'SIM');
                    actualState.form['NotifyTask'] = result;
                    actualState.phase = 'doneCreate';

                case 'doneCreate':
                    const responseObject = {
                        'body' : actualState.form
                    }
                    var result = await services.CreateNewTask(responseObject);

                    if(result != undefined && result != null){
                        var message = "🗒️ *Sua tarefa:*\n\n";
                        message += `📋 *Tarefa:* ${actualState.form.TaskName}\n`;
                        message += `📝 *Descrição:* ${actualState.form.TaskDesc}\n`;
                        message += `📅 *Data:* ${new Date(actualState.form.HourTask).toLocaleDateString('pt-BR')}\n`;               
                        await this.bot.sendMessage(chatId,'Tarefa criada com sucesso!');
                        await this.bot.sendMessage(chatId,message, {parse_mode : "Markdown"});
                        delete states[chatId];
                        errorCounter = 0;
                        return res.sendStatus(200);
                    }

                    await this.bot.sendMessage(chatId,'Houve um problema ao criar sua tarefa, tente novamente.');
                    delete states[chatId];
                    errorCounter = 0;
                    return res.sendStatus(200);

                default:
                    break;
            }

        }

        if (req.body.message.text === '/tarefas')
        {
            try {
                const read = await services.GetTasks();
                if(read != false && read != undefined)
                {
                    const tasks = read;        
                    let message = "🗒️ *Suas tarefas:*\n\n";
                    tasks.forEach(task => {
                        message += `📋 *Tarefa:* ${task.TaskName}\n`;
                        message += `📝 *Descrição:* ${task.TaskDesc}\n`;
                        message += `📅 *Data:* ${new Date(task.HourTask).toLocaleDateString('pt-BR')}\n`;
                        message +=  task.TaskDone ? `✅ *Concluída:* Sim\n\n`  : `❌ *Concluída:* Não\n\n`; 
                    });
                    // console.log("BODY RECEIVED:", JSON.stringify(req.body, null, 2));
                    await this.bot.sendMessage(req.body.message.chat.id, message, { parse_mode: "Markdown" });
                    return res.sendStatus(200);
                }
                console.log('Get Tasks Return: ',read);
                let badMessage = "Problema ao ler tasks, tente novamente";
                await this.bot.sendMessage(req.body.message.chat.id, badMessage, { parse_mode: "Markdown" });
                return res.sendStatus(404);

            } 
            catch (error) {
                console.error("Erro ao buscar tarefas:", error);
                await this.bot.sendMessage(chatId ,"❌ Erro ao carregar as tarefas.");
                return res.sendStatus(500);
            }
        }

        else if(req.body.message.text === '/criar'){
            try 
            {            
                await this.bot.sendMessage(chatId, 'Envie o nome da nova tarefa:')
                let idTask = await services.getTaskId();
                states[chatId] = {
                    phase : 'nameCreate',
                    form : {
                        'TaskId' : idTask, 'TaskName' : '', 'NotifyTask' : true, 'TaskDesc' : '', 'HourTask' : '', 
                        'IsEditingTask' : false, 'CanChange' : true,'TaskDone' : false, 'hour' : '', 'date' : '', 'Notifications' : {
                            "Sent15min" : true, "Sent5min" : true
                        }
                    }
                }
                return res.sendStatus(200);
                } 

            catch (error) {
                console.error('Erro ao criar tarefa', error);
                return res.sendStatus(500);
            }
        }

        else if (req.body.message.text === '/editar')
        {
            try 
            {
                const read = await services.GetTasks();
                if(read != false && read != undefined)
                {
                    const tasks = read; 
                    const buttons = tasks.map(t => ([{
                        text: t.TaskName,
                        callback_data: `editar:${t.TaskId}`
                    }]));
                    
                    this.bot.sendMessage(chatId, "Escolha qual tarefa deseja editar:", {
                        reply_markup: {
                            inline_keyboard: buttons
                        }
                    });
                    
                    return res.sendStatus(200);               
                }
            
                let badMessage = "Problema ao editar tasks, tente novamente";
                await this.bot.sendMessage(req.body.message.chat.id, badMessage, { parse_mode: "Markdown" });
                return res.sendStatus(404);
                } 
            catch (error) {
                console.error("Erro ao editar tarefas:", error);
                await this.bot.sendMessage(chatId ,"❌ Erro ao editar as tarefas.");
                return res.sendStatus(500);                
            }
        }
        
        else if(req.body.message.text === '/deletar')
        {
            try
            {
                let tasks = await services.GetTasks();

                if (tasks != false && tasks != undefined){
                    const buttons = tasks.map(t => ([{
                        text: t.TaskName,
                        callback_data: `delete:${t.TaskId}`
                    }]));

                    this.bot.sendMessage(chatId, "Escolha qual tarefa deseja deletar:", {
                        reply_markup: {
                            inline_keyboard: buttons
                        }
                    });

                    return res.sendStatus(200)
                }

                const errorMessage = 'Erro ao deletar tarefa'
                await this.bot.sendMessage(chatId, errorMessage, { parse_mode: "Markdown" });
                return res.sendStatus(200);
            } 
            
            catch (error) {
                console.error("Erro ao deletar tarefas:", error);
                await this.bot.sendMessage(chatId ,"❌ Erro ao deletar as tarefas.");
                return res.sendStatus(500);                   
            }
        }

        else{
            await this.bot.sendMessage(chatId, 'Comando não identificado.', { parse_mode: "Markdown" });                
            return res.sendStatus(200);
        }
    }

    if (req.body.callback_query)
    {
        try{
            const query = req.body.callback_query;
            const messageId = query.message.message_id;
            const [action, taskId] = query.data.split(':');
            if (action === 'editar'){
                await this.bot.deleteMessage(query.message.chat.id,messageId);
                const tasks = await services.GetTasks(); 
                const taskFounded = tasks.find(t => t.TaskId === Number(taskId));
                await this.bot.sendMessage(query.message.chat.id, `📝 Editando tarefa: ${taskFounded.TaskName}\nEnvie o novo nome da tarefa:`);

                states[query.message.chat.id] = {
                    phase : 'name',
                    id: taskFounded.TaskId,
                    form: {
                        "id":taskFounded.TaskId ,"name" : "", "desc" : "", "hour" : "","notify" : "", "date": ""
                    }
                };
            }

            if (action === 'delete'){
                await this.bot.deleteMessage(query.message.chat.id,messageId);
                let responseObject = {
                    'query' : {
                        'taskId' : taskId
                    }
                }

                let response = await services.DeleteTask(responseObject);

                if(response)
                    await this.bot.sendMessage(query.message.chat.id,'Tarefa deletada');
                else
                    await this.bot.sendMessage(query.message.chat.id,'Erro ao deletar tarefa');

                return res.sendStatus(200)

            }

            return res.sendStatus(200);
        }
        catch(error){
            await this.bot.sendMessage(query.message.chat.id, `📝 Erro desconhecido`);
            return res.sendStatus(200);
        }

    }

    return res.sendStatus(200);
     
};



async editTelegram(req) {
    try 
    {        
        let tasks = await services.GetTasks();
        if (tasks != undefined)
        {
            var toUpdate = await tasks.filter(x => x.TaskId == Number(req.id));
            if (toUpdate.length >= 1){     
                toUpdate.TaskName = req.name;
                toUpdate.TaskDesc = req.desc;
                toUpdate.HourTask = this.parseBrazilianDate(`${req.date} - ${req.hour}`);
                toUpdate.NotifyTask = req.notify;

                for await (const tks of tasks) {        
                    if(tks.TaskId == Number(req.id)){
                        tks.TaskName = toUpdate.TaskName;
                        tks.TaskDesc = toUpdate.TaskDesc;
                        tks.HourTask = toUpdate.HourTask;
                        tks.NotifyTask = toUpdate.NotifyTask;
                        await fs.writeFile(FILENAME,JSON.stringify(tasks));             
                        return toUpdate; 
                    }                    
                }
                return false;
            }
            else
                return false;
        }         
    } 
    catch (error) 
    {
        console.log("Error on editTelegram function :",error);
        return undefined;
    }
}

parseBrazilianDate(str) {
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

async checkNotification(){
    try {
        var arrToNofity =  await services.checkNotifcationsOnTasks();
        if(!arrToNofity.length) return undefined;    

        let message = "🗒️ *Suas tarefa:*\n\n";
        arrToNofity.forEach(item => {
            message += `📋 *Tarefa:* ${item.task.TaskName}\n`;
            message += `📝 *Descrição:* ${item.task.TaskDesc}\n`;
            var alertMessage = item.type === '15min' ? 'Faltam 15 minutos para ser concluida' : 'Faltam 5 minutos para ser concluida'
            message += alertMessage;
        });

        await this.bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    } 
    catch (error) {
        console.log("Error on checkNotifications:",error);
    }
}

// async DbTest(){
//     return await services.GetAllTasksFromDb();
// }

}

module.exports = TelegramHandler;
