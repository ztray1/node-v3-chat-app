const socket=io();

/*socket.on("countUpdated",(count)=>{
    console.log("The count has been updated",count);
})

document.querySelector("#increment").addEventListener("click",()=>{
    console.log("clicked");
    socket.emit("increment");
})*/

const $messageForm=document.querySelector("#message-form");
const $messageFormInput=$messageForm.querySelector("input");
const $messageFormButton=$messageForm.querySelector("button");
const $sendLocationButton=document.querySelector("#send-location");
const $messages=document.querySelector("#messages");
const messagetemplate=document.querySelector("#message-template").innerHTML;
const locationtemplate=document.querySelector("#location-message-template").innerHTML;
const sidebartemplate=document.querySelector("#sidebar-template").innerHTML;

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    console.log(containerHeight - newMessageHeight, scrollOffset);
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
        console.log("yes",$messages.scrollTop, $messages.scrollHeight);
    }

}

socket.on("message",(message)=>{
    console.log(message);
    const html=Mustache.render(messagetemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend",html);
    autoscroll();
})

socket.on("locationMessage",(url)=>{
    const html=Mustache.render(locationtemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend",html);
    autoscroll();
})

socket.on("roomData",({room,users})=>{
    const html=Mustache.render(sidebartemplate,{
        room,
        users
    })
    document.querySelector("#siderbar").innerHTML=html;
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    const message=e.target.elements.message.value;

    $messageFormButton.setAttribute("disabled","disabled");

    socket.emit("sendmessage",message,(error)=>{
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value="";
        $messageFormInput.focus();
        if(error)
        {
            return console.log(error);
        }
        console.log("the message has been delivered");
    });
})

$sendLocationButton.addEventListener("click",()=>{
    $sendLocationButton.setAttribute("disabled","disabled");
    if(!navigator.geolocation){
        return alert("cannot get the location");
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("sendlocation",{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute("disabled");
            console.log("location shared");
        })
    });
})

socket.on("roomData",({room,users})=>{
    console.log(room);
    console.log(users);
})


socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error);
        location.href="/";
    }
});
