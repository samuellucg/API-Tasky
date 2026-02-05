const taskService = require('../services/taskService.js');
const taskCreateDto = require('../dtos/createTaskDto.js');
module.exports = {
    getAll: async (req,res) => {
        try{        
            var tasks = await taskService.GetAllTasksFromDb();
            if (tasks)
                return res.json(tasks).status(200);
            else if(!tasks){
                return res.status(400).json({error: "Error getting all tasks"});
            }
            return res.status(400).json({error: "Error in tasks"});
        }         
        catch (err) 
        {
            res.status(500).json({error: `Unknown error: ${err}`});
        }
    },
    create: async (req,res) => {
        try{
            var dto = new taskCreateDto(req.body);
            var tasks = await taskService.CreateNewTaskFromDb(dto);
            if (tasks)
                return res.json(tasks).status(200);
            else if(!tasks)
                return res.status(400).json({error: "Error creating a new task"});            
            else
                return res.status(400).json({error: "undefined"});            
        }
        catch(err){
            res.status(500).json({error: `Unknown error: ${err}`});
        }
    },
    update: async (req,res) => 
    {
        try 
        {
            var tasks = await taskService.EditTaskByUserFromDb(req.body);
            if(tasks)
                return res.status(200).send("OK");            
            else if(!tasks)
                return res.status(400).send("Error on parameter taskId");            
            return res.status(400).send("Undefined");
        }         
        catch (error) {
            res.status(500).json({error: `Unknown error: ${err}`});       
        }    
    },
    delete: async (req,res) => 
    {
        try 
        {
            var tasks = await taskService.DeleteTaskByUserFromDb(req.query.taskId);
            if(tasks)
                return res.status(200).send("OK");            
            else if(!tasks)
                return res.status(400).json({error: "Something goes wrong..."})            
            return res.status(400).send("Undefined");
        } 
        catch (error) 
        {
            res.status(500).json({error: `Unknown error: ${err}`});          
        }
    },
    healthcheck: async (req,res) => {
        return res.status(200).send("OK");
    },
    test: async(req,res) => {
        var data = await taskService.TestSocket();
        return res.status(200).send(data);
    }
};
