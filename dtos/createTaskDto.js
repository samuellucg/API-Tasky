class CreateTaskDto {
    constructor({ TaskName, TaskDesc, HourTask, NotifyTask, IsEditingTask, CanChange, TaskId, TaskDone } = {}) {
        this.TaskId = TaskId ?? null;
        this.TaskName = TaskName ? String(TaskName).trim() : '';
        this.TaskDesc = TaskDesc ? String(TaskDesc).trim() : '';
        this.HourTask = HourTask ? new Date(HourTask) : null;
        this.TaskDone = TaskDone ?? false;
        this.NotifyTask = NotifyTask ?? true;
        this.IsEditingTask = IsEditingTask ?? false;
        this.CanChange = CanChange ?? true;
    }
}

module.exports = CreateTaskDto;
