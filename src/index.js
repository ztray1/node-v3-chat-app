const path=require("path");

const express =require("express");

const http=require("http");

const socketio=require("socket.io");

const Filter=require("bad-words");

const {generateMessage,generateLocationMessage}=require("./utils/messages");

const {addUser,removeUser,getUser,getUsersInRoom}=require("./utils/users");

const app=express();
const server=http.createServer(app);
const io=socketio(server);

const port=process.env.PORT||3000;

const publicDirectory=path.join(__dirname,"../public");

app.use(express.static(publicDirectory));

let count=0;

io.on("connection",(socket)=>{
    //console.log("new websocket connection");
    /*socket.emit("countUpdated",count);
    socket.on("increment",()=>{
        count++;
        io.emit("countUpdated",count);
    })*/
    socket.on("join",(options,callback)=>{
        const {user,error}=addUser({id:socket.id,...options})
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit("message",generateMessage("admin","welcome!"));
        socket.broadcast.to(user.room).emit("message",generateMessage("admin",`${user.username} has joined`));
        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback();
    })
    socket.on("sendmessage",(msg,callback)=>{
        const user=getUser(socket.id);
        const filter=new Filter();
        if(filter.isProfane(msg)){
            return callback("Profanity is not allowed");
        }
        io.to(user.room).emit("message",generateMessage(user.username,msg));
        callback();
    })
    socket.on("disconnect",()=>{
        const user=removeUser(socket.id);
        if(user){
            io.to(user.room).emit("message",generateMessage(user.username,`${user.username} has left`));
            io.to(user.room).emit("roomData",{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

    socket.on("sendlocation",(coords,callback)=>{
        const user=getUser(socket.id);
        io.to(user.room).emit("locationMessage",generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })
})

server.listen(port,()=>{
    console.log(`Server is up on ${port}`);
})