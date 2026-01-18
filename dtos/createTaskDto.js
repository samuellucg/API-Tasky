class CreateTaskDto {
    constructor({TaskName,TaskDesc,HourTask,NotifyTask,IsEditingTask,CanChange,TaskId,TaskDone}) {
        this.TaskId = TaskId;
        this.TaskName = TaskName.trim();
        this.TaskDesc = TaskDesc.trim();
        this.HourTask = new Date(HourTask);
        this.TaskDone = TaskDone;
        this.NotifyTask =  NotifyTask;
        this.IsEditingTask = IsEditingTask;
        this.CanChange = CanChange;
    }
}

module.exports = CreateTaskDto;