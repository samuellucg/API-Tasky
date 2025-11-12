const services = require('../services/taskService');
const fsPromisses = require('fs/promises');
const path = require('path');

const fs = fsPromisses;
let states = {};
let app;
let bot;
let port;
const OLD_FILENAME = '../Data/Database.json' 
const FILENAME = path.join(__dirname, '../data/Database.json');

class TelegramHandler {
  constructor(_app,_bot,_port) {
    app = _app;
    bot = _bot;
    port = _port;
    this.routesTelegram = this.routesTelegram.bind(this);
    this.editTelegram = this.editTelegram.bind(this);
    this.parseBrazilianDate = this.parseBrazilianDate.bind(this);
    // se precisar, injeta dependências aqui
  }

async routesTelegram(req,res){
    console.log("we are here");
    if(req.body.message)
    {
        const chatId = req.body.message.chat.id;
        
        if(states[chatId]){
            const actualState = states[chatId];

            switch (actualState.phase) {
                case 'name':
                    actualState.form['name'] = req.body.message.text;
                    actualState.phase = 'desc';
                    await bot.sendMessage(chatId, 'Agora envie a nova descrição');
                    return res.sendStatus(200);

                case 'desc':
                    actualState.phase = 'date';
                    actualState.form['desc'] = req.body.message.text;
                    await bot.sendMessage(chatId, 'Agora envie a nova data: \nOBS:Mantenha nesse formato: (DD/MM/YYYY)');
                    return res.sendStatus(200);

                case 'date':
                    actualState.phase = 'hour';
                    actualState.form['date'] = req.body.message.text;
                    await bot.sendMessage(chatId, 'Agora envie o novo horário de conclusão da tarefa: \nOBS:Mantenha nesse formato: (00:00)');
                    return res.sendStatus(200);
                
                case 'hour':
                    actualState.phase = 'notify';
                    actualState.form['hour'] = req.body.message.text;
                    await bot.sendMessage(chatId, 'Deseja notificar a mensagem? Envie Sim/Não ou (S/N)'); // melhorar isso para evitar respostas indevidas fazer checkbox
                    return res.sendStatus(200);
                    
                case 'notify':
                    actualState.phase = 'done';
                    actualState.form['notify'] = req.body.message.text;
                    await bot.sendMessage(chatId, 'Deseja salvar as alterações?'); // melhorar isso para evitar respostas indevidas fazer checkbox
                    return res.sendStatus(200);

                case ('done' || req.body.message.text == ('SIM' || 'sim' || 's' || 'S')):
                    await bot.sendMessage(chatId,'Atualizando tarefa...')            
                    states = {};
                    var returnStatus = await this.editTelegram(actualState.form);
                    console.log("RETURN DONE VALUE\N\N\N\N\N\N:",returnStatus);
                    return returnStatus == true ? res.sendStatus(200) : res.sendStatus(500);                         
                default:
                    break;
            }

            //#region  OLD CODE HERE!
            /*
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
                return await editTelegram(JSON.stringify(actualState.form)); 
                try {                    
                    await fetch(`http://localhost:${port}/edittelegram`,{
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
            */
            //#endregion
        }

        if (req.body.message.text === '/tarefas') // listo
        {
            try {
                const read = await services.GetTasks();
                if(read != false && read != undefined)
                {
                    const tasks = read;        
                    let message = "🗒️ *Suas tarefas:*\n\n";
                    tasks.forEach(task => {
                        message += `📋 *Tarefa:* ${task.TaskName}\n`;
                        message += `📅 *Data:* ${new Date(task.HourTask).toLocaleDateString('pt-BR')}\n`;
                        message +=  task.TaskDone ? `✅ *Concluída:* Sim\n\n`  : `❌ *Concluída:* Não\n\n`; 
                    });
                    await bot.sendMessage(req.body.message.chat.id, message, { parse_mode: "Markdown" });
                    return res.sendStatus(200);
                }
                let badMessage = "Problema ao ler tasks, tente novamente";
                await bot.sendMessage(req.body.message.chat.id, badMessage, { parse_mode: "Markdown" });
                return res.sendStatus(404);

            } 
            catch (error) {
                console.error("Erro ao buscar tarefas:", error);
                await bot.sendMessage(chatId ,"❌ Erro ao carregar as tarefas.");
                return res.sendStatus(500);
            }
        }

        else if (req.body.message.text === '/editar') // listo
        {
            try 
            {
                const read = await services.GetTasks();
                if(read != false && read != undefined)
                {
                    const tasks = await read; 
                    const buttons = tasks.map(t => ([{
                        text: t.TaskName,
                        callback_data: `editar:${t.TaskId}`
                    }]));
                    
                    bot.sendMessage(chatId, "Escolha qual tarefa deseja editar:", {
                        reply_markup: {
                            inline_keyboard: buttons
                        }
                    });
                    
                    return res.sendStatus(200);               
                }
            
                let badMessage = "Problema ao editar tasks, tente novamente";
                await bot.sendMessage(req.body.message.chat.id, badMessage, { parse_mode: "Markdown" });
                return res.sendStatus(404);
                } 
            catch (error) {
                console.error("Erro ao editar tarefas:", error);
                await bot.sendMessage(chatId ,"❌ Erro ao editar as tarefas.");
                return res.sendStatus(500);                
            }
        }

        else if(req.body.message.text === '/deletar')
        {
            try
            {            
                var message = 'Em desenvolvimento...';
                await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
                return res.sendStatus(200);
            } 
            
            catch (error) {
                console.error("Erro ao editar tarefas:", error);
                await bot.sendMessage(chatId ,"❌ Erro ao editar as tarefas.");
                return res.sendStatus(500);                   
            }
        }
        // seu próximo passo é desenvolver o criar tarefa e deletar. Depois melhorar realmente a lógica do telegram handler.
        else{
             // TRATAR PARA ISSO RETORNAR APENAS QUANDO NECESSÁRIO
            await bot.sendMessage(chatId, 'Comando não identificado.', { parse_mode: "Markdown" });                
            return res.sendStatus(200);
        }
    }

    if (req.body.callback_query)
    {
        const query = req.body.callback_query;
        const messageId = query.message.message_id;
        const [action, taskId] = query.data.split(':');
        if (action === 'editar'){
            await bot.deleteMessage(query.message.chat.id,messageId);
            const read = await fetch(`http://localhost:${port}/tasks`);
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
        return res.sendStatus(200);
    }
     
};



async editTelegram(req) {
    console.log("on edit Function");
    let tasks = await services.GetTasks();
    if (tasks != undefined)
    {
        var toUpdate = await tasks.filter(x => x.TaskId == Number(req.id));
        // console.log("toUpdate:", toUpdate);
        if (toUpdate.length >= 1){
            var flag = ["sim", "s"].includes(req.notify?.toLowerCase()); 
            toUpdate.TaskName = req.name;
            toUpdate.TaskDesc = req.desc;
            toUpdate.HourTask = this.parseBrazilianDate(`${req.date} - ${req.hour}`);
            toUpdate.NotifyTask = flag;
            tasks.forEach(async el => {
                if(el.TaskId == Number(req.id)){
                    el.TaskName = toUpdate.TaskName;
                    el.TaskDesc = toUpdate.TaskDesc;
                    el.HourTask = toUpdate.HourTask;
                    el.NotifyTask = toUpdate.NotifyTask;
                    await fs.writeFile(FILENAME,JSON.stringify(tasks));
                    return true;
                }
            })
            console.log("vai retornar 500");
            return false;
        }
        else
            console.log("vai retornar else");
            return false;
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

}

module.exports = TelegramHandler;


//#region OLD EDITTELEGRAM ENDPOINT
/*
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
*/
//#endregion