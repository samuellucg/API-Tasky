const taskService = require('../services/taskService.js');

module.exports = {
    getAll: async (req,res) => {
        try{        
            var tasks = await taskService.GetTasks(req);
            if (tasks != false)
            {
                return res.json(tasks).status(200);
            }        
            return res.status(400).json({error: "Error in tasks"});
        }         
        catch (err) 
        {
            res.status(500).json({error: "Unknown error"});
        }
    },
    create: async (req,res) => {
        try{
            var tasks = await taskService.CreateNewTask(req);
            if (tasks){
                return res.json(tasks).status(200);
            }

            else if(tasks === null){
                return res.status(400).json({error: "Error creating a new task"});
            }

            else{
                return res.status(400).json({error: "undefined"}); 
            }
        }
        catch(err){
            res.status(500).json({error: "Unknown error"});
        }
    },
    update: async (req,res) => 
    {
        try 
        {
            var tasks = await taskService.UpdateTask(req);
            console.log("tasks val:",tasks);
            if(tasks != false){
                console.log("!= false");
                return res.status(200).send("OK");
            }
            else if(tasks === false){
                return res.status(400).send("Error on parameter taskId");
            }
            return res.status(400).send("Undefined");

        } 
        
        catch (error) {
            return res.status(500).send("Unknown error");
            
        }    
    },
    delete: async (req,res) => 
    {
        try 
        {
            console.log("on delete")
            var tasks = await taskService.DeleteTask(req);
            if(tasks){
                return res.status(200).send("OK");
            }
            else if(tasks === false){
                return res.status(400).json({error: "Something goes wrong..."})
            }
            return res.status(400).send("Undefined");
        } 
        catch (error) 
        {
            return res.status(500).send("Unknown error");            
        }
    },
    healthcheck: async (req,res) =>{
        return res.status(200).send("OK");
    },
    test: async(req,res) => {
        await taskService.checkNotifcationsOnTasks();
        return res.status(200).send("OK");
    }
};
