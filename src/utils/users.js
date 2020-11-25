const users=[];

const addUser=({id,username,room})=>{
    username=username.trim().toLowerCase();
    room=room.trim().toLowerCase();
    if(!username||!room){
        return{
            error:"username and room are required"
        }
    }
    const existinguser=users.find((user)=>user.room===room&&user.username===username)

    if(existinguser){
        return{
            error:"Username is in use"
        }
    }
    const user={
        id,username,room
    }
    users.push(user);
    console.log(users);
    return {user};
}


const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser=(id)=>{
    return users.find((user)=>user.id===id);
}

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase();
    return users.filter((user)=>user.room===room)
}
/*addUser({
    id:22,
    username:"allen",
    room:"123456"
})

console.log(users);
const finduser=getUser(22);
console.log(finduser);

const userinroom=getUsersInRoom('12345116');
console.log(userinroom);*/

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}