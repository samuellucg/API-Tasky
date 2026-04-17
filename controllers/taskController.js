const taskService = require('../services/taskService.js');
const taskCreateDto = require('../dtos/createTaskDto.js');
const updateTaskDto = require('../dtos/updateTaskDto.js');

module.exports = {
    getAll: async (req, res) => {
        try {
            const tasks = await taskService.GetAllTasksFromDb();
            if (tasks) {
                return res.status(200).json(tasks);
            }
            return res.status(404).json({ error: "No tasks found" });
        } catch (error) {
            console.error("Error in getAll:", error.message);
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    getAllFromUser: async (req, res) => {
        try {
            const { userId } = req.query;
            const tasks = await taskService.GetAllTasksByUserFromDb(userId);
            if (tasks) {
                return res.status(200).json(tasks);
            }
            return res.status(404).json({ error: "No tasks found" });
        } catch (error) {
            console.error("Error in getAll:", error.message);
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    create: async (req, res) => {
        try {
            const { chatId, ...taskData } = req.body;
            const dto = new taskCreateDto(taskData.body);
            const result = await taskService.CreateNewTaskFromDb({ ...dto, chatId });
            if (result) {
                return res.status(201).json({ message: "Task created successfully" });
            }
            return res.status(400).json({ error: "Error creating task" });
        } catch (error) {
            console.error("Error in create:", error.message);
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    update: async (req, res) => {
        try {
            const { chatId, ...taskData } = req.body;
            const dto = new updateTaskDto(taskData);
            const result = await taskService.EditTaskByUserFromDb(dto, chatId);
            if (result) {
                return res.status(200).json({ message: "Task updated successfully" });
            }
            return res.status(400).json({ error: "Error updating task" });
        } catch (error) {
            console.error("Error in update:", error.message);
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    delete: async (req, res) => {
        try {
            const { taskId } = req.params;
            const { userId } = req.query;
            const result = await taskService.DeleteTaskByUserFromDb(taskId, userId);
            if (result) {
                return res.status(200).json({ message: "Task deleted successfully" });
            }
            return res.status(400).json({ error: "Error deleting task" });
        } catch (error) {
            console.error("Error in delete:", error.message);
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    healthcheck: async (req, res) => {
        return res.status(200).json({ status: "OK" });
    },
    test: async (req, res) => {
        const data = await taskService.TestSocket();
        return res.status(200).json({ data });
    }
};
