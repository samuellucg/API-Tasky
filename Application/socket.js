const {Server} = require('socket.io'); 

let io;

function InitSocket(httpServer) 
{
    io = new Server(httpServer);

    io.on("connection", (socket) => {
        if(socket.connected)
            console.log("User connected to socket!");

        socket.emit("Test", "Sending to client on C#")

        registerTasksEvents(socket);
    });

    return io;
}

function EmitEvent(eventName, payload){
    io.emit(eventName,payload);
}

function registerTasksEvents(socket){
    socket.on("CreateTask", (data) => {
        console.log("Event: CreateTask");
        console.log(`Received: ${data}`);
    });

    // eventos que possam vir da ui serão registrados aqui...
}

module.exports = {InitSocket, EmitEvent}
