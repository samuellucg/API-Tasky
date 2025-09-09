const express = require('express');
const fss = require('fs/promises');

const app = express();
app.use(express.json());
const fs = fss;
const PORT = 3000;

const resJson = [{ICreate: "ApiTasky", Who: "SL MADE THIS"}, {NotifcationBy: "FCM", MadeBy: "Google"},{
    And: "We gonna mix that!", Productors: "SL + FCM"}, {FirstDay: "Today i'ts 20:28 01/09/2025", 
        Im: "Creating tasky api, but we least got the app v1 created!"}]

app.get("/", (req,res) => {
    res.json(resJson);
});

app.get("/tasks", async (req,res) => {
    try{        
        const data = await fs.readFile('C:\\Users\\Pichau\\source\\repos\\API-Tasky\\Infra\\Database.json','utf8') // lê o arquivo completo : string
        const tasks = JSON.parse(data); // passa toda a string pra um json
        return res.status(200).json(tasks); // retorna 200 e o json
    } catch (err) {
        res.sendStatus(500).json({error: "Não foi possível ler as tarefas"});
    }
});

app.post("/createtask", async (req,res) => {
    try{
        const data = await fs.readFile('C:\\Users\\Pichau\\source\\repos\\API-Tasky\\Infra\\Database.json','utf8') // lê o arquivo completo : string
        const tasks = JSON.parse(data); // passa toda a string para um json
        tasks.push(req.body); // adiciona o json enviado na requisição para o arquivo
        fs.writeFile('C:\\Users\\Pichau\\source\\repos\\API-Tasky\\Infra\\Database.json',JSON.stringify(tasks)); // subscreve o arquivo com a nova tarefa        
        res.status(200).send("OK"); // retorna 200 
    }
    catch (err) {
        res.sendStatus(500).json({error: "Erro ao salvar nova tarefa"});
    }
});

app.delete("/deletetask", async (req,res) => {
    try {
        const data = await fs.readFile('C:\\Users\\Pichau\\source\\repos\\API-Tasky\\Infra\\Database.json','utf8') // lê o arquivo completo : string
        var tasks = JSON.parse(data); // passa toda a string para um json
        var newTasks = tasks.filter(x => x.TaskId != Number(req.query.taskId));
        fs.writeFile('C:\\Users\\Pichau\\source\\repos\\API-Tasky\\Infra\\Database.json',JSON.stringify(newTasks)); // subscreve o arquivo com a nova tarefa]
        console.log("retornando");
        res.status(200).send("OK");        
        // console.log("AAAAAAA",req.query.taskid);
    } catch (err) {
        res.sendStatus(500).json({error: "Erro ao deletar nova tarefa"});
    }
});

app.put("/edittask", async (req,res) => {
    try {
        const data = await fs.readFile('C:\\Users\\Pichau\\source\\repos\\API-Tasky\\Infra\\Database.json','utf8') // lê o arquivo completo : string
        var tasks = JSON.parse(data); // passa toda a string para um json
        var toSave = tasks.filter(x => x.TaskId == Number(req.query.taskId));
        console.log(`Tarefa antiga: ${toSave}`);
        toSave.TaskName = req.body.TaskName;
        toSave.TaskDesc = req.body.TaskDesc;
        toSave.HourTask = req.body.HourTask;
        console.log(`Nova tarefa: ${toSave}`);

        tasks.forEach(element => {
            console.log("No foreach");
            if(element.TaskId == Number(req.query.taskId)){
                element.TaskName = toSave.TaskName;
                element.TaskDesc = toSave.TaskDesc;
                element.HourTask = toSave.HourTask;
                console.log("Escrevendo");
                fs.writeFile('C:\\Users\\Pichau\\source\\repos\\API-Tasky\\Infra\\Database.json',JSON.stringify(tasks)); // subscreve o arquivo com a nova tarefa]
                return res.status(200).send("OK");
            } 
        });        
        return res.sendStatus(400);
    }     
    catch (err) {
        
    }
})


// DELETE FUNCIONAL PORÉM AGORA COM BUGS EM RETORNO DE STATUS, CONFIRMAR ISSO TESTE EM POST


app.listen(PORT, () => {
    console.log(`Api running on port ${PORT}`);
});


