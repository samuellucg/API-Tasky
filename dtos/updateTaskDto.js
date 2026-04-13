class UpdateTaskDto {
    constructor(data = {}) {
        if (!data.TaskId) {
            throw new Error('TaskId is required for update');
        }
        this.TaskId = data.TaskId;

        if (data.TaskName !== undefined) this.TaskName = String(data.TaskName).trim();
        if (data.TaskDesc !== undefined) this.TaskDesc = String(data.TaskDesc).trim();
        if (data.HourTask !== undefined) this.HourTask = data.HourTask;
        if (data.NotifyTask !== undefined) this.NotifyTask = Boolean(data.NotifyTask);
        if (data.TaskDone !== undefined) this.TaskDone = Boolean(data.TaskDone);
        if (data.CanChange !== undefined) this.CanChange = Boolean(data.CanChange);
        if (data.IsEditingTask !== undefined) this.IsEditingTask = Boolean(data.IsEditingTask);
    }
}

module.exports = UpdateTaskDto;