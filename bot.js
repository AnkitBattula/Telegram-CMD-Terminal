require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { exec } = require("child_process");
const express = require("express");


// ================= WEB DASHBOARD =================

const app = express();

const PORT = process.env.PORT || 3000;

const startTime = Date.now();


app.get("/", (req, res) => {

    const uptimeStart = startTime;

    res.send(`

<!DOCTYPE html>
<html>

<head>

<title>Telegram Terminal Bot</title>

<meta name="viewport" content="width=device-width, initial-scale=1">

<style>

body {
    background:#0f172a;
    color:white;
    font-family:Arial;
    text-align:center;
    padding:40px;
}

.card {

    background:#1e293b;
    max-width:500px;
    margin:auto;
    padding:30px;
    border-radius:20px;

}

h1 {
    color:#22c55e;
}

.status {

    font-size:25px;
    color:#22c55e;

}

.value {

    font-size:28px;
    font-weight:bold;

}


</style>

</head>


<body>


<div class="card">

<h1>🤖 Telegram Terminal Bot</h1>

<div class="status">
🟢 ONLINE
</div>


<h3>Uptime</h3>

<div class="value" id="uptime">
Loading...
</div>


<h3>Started</h3>

<p id="started"></p>


<h3>Current Time</h3>

<p id="clock"></p>


</div>



<script>


const start = ${uptimeStart};


document.getElementById("started").innerHTML =
new Date(start).toString();



function update(){


const now = Date.now();


const seconds =
Math.floor((now - start) / 1000);



const days =
Math.floor(seconds / 86400);


const hours =
Math.floor((seconds % 86400) / 3600);


const minutes =
Math.floor((seconds % 3600) / 60);


const secs =
seconds % 60;



document.getElementById("uptime").innerHTML =

days + "d " +
hours + "h " +
minutes + "m " +
secs + "s";



document.getElementById("clock").innerHTML =
new Date().toString();


}


setInterval(update,1000);

update();


</script>


</body>

</html>

`);

});



app.listen(PORT,()=>{

console.log(
"🌐 Dashboard running on port " + PORT
);

});





// ================= TELEGRAM BOT =================


if(!process.env.BOT_TOKEN){

console.log("BOT_TOKEN missing");

process.exit(1);

}



const bot = new TelegramBot(
process.env.BOT_TOKEN,
{
polling:true
}
);



console.log(
"🚀 Telegram Terminal Bot Started"
);





// Alive message


setTimeout(()=>{


if(process.env.ALIVE_CHAT_ID){


bot.sendMessage(

process.env.ALIVE_CHAT_ID,

"🟢 Telegram Terminal Bot is Alive\n\n"+
"🖥 Server: Render\n"+
"🌐 Dashboard Online"

);


}


},5000);






// Execute commands


bot.on("message",(msg)=>{


const chatId = msg.chat.id;

const command = msg.text;


if(!command)
return;



console.log(
"Command:",
command
);



exec(

command,

{

shell:"/bin/bash",

timeout:120000,

maxBuffer:50*1024*1024

},


(error,stdout,stderr)=>{


let output="";


if(stdout)
output+=stdout;


if(stderr)
output+="\n\nSTDERR:\n"+stderr;


if(error)
output+="\n\nERROR:\n"+error.message;



if(!output)
output="✅ Command completed";



sendOutput(
chatId,
output
);


});


});





async function sendOutput(chatId,text){


const limit=4000;


while(text.length > limit){


await bot.sendMessage(

chatId,

text.substring(0,limit)

);


text=text.substring(limit);


}



await bot.sendMessage(
chatId,
text
);


}




bot.on(
"polling_error",
(err)=>{

console.log(
"Polling Error:",
err.message
);

});
