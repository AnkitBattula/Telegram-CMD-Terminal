require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { exec } = require("child_process");
const express = require("express");


// =========================
// WEB DASHBOARD
// =========================

const app = express();

const PORT = process.env.PORT || 3000;

const startTime = Date.now();


app.get("/", (req, res)=>{

    res.send(`
<!DOCTYPE html>
<html>

<head>

<title>Telegram Terminal Bot Status</title>

<meta name="viewport" content="width=device-width,initial-scale=1">

<style>

body{
    background:#0b0f19;
    color:white;
    font-family:Arial;
    text-align:center;
    padding:40px;
}


.card{

background:#151b2b;
padding:25px;
border-radius:20px;
max-width:500px;
margin:auto;

box-shadow:0 0 20px #000;

}


h1{
color:#00ff88;
}


.status{

font-size:22px;
color:#00ff88;

}


.time{

font-size:30px;
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


<br>


<h3>Server Uptime</h3>

<div class="time" id="uptime">
Loading...
</div>


<h3>Started At</h3>

<p id="started"></p>


<h3>Current Time</h3>

<p id="clock"></p>


</div>



<script>


const started = new Date(${startTime});


document.getElementById("started").innerHTML =
started.toString();



function update(){


let now = Date.now();


let diff =
Math.floor((now-${startTime})/1000);


let d =
Math.floor(diff/86400);


let h =
Math.floor(diff%86400/3600);


let m =
Math.floor(diff%3600/60);


let s =
diff%60;



document.getElementById("uptime").innerHTML =
`${d}d ${h}h ${m}m ${s}s`;


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


app.listen(PORT, ()=>{

console.log(
`🌐 Dashboard running on port ${PORT}`
);

});





// =========================
// TELEGRAM BOT
// =========================


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
"🟢 Telegram Terminal Bot Alive\n\n"+
"🖥 Render Server Online\n"+
"🌐 Dashboard Active"
);


}


},3000);





// Commands


bot.on("message",(msg)=>{


const chatId =
msg.chat.id;


const command =
msg.text;


if(!command)
return;



exec(

command,

{

shell:"/bin/bash",

timeout:120000,

maxBuffer:
50*1024*1024

},


(error,stdout,stderr)=>{


let output="";


if(stdout)
output+=stdout;


if(stderr)
output+=
"\nSTDERR:\n"+stderr;



if(error)
output+=
"\nERROR:\n"+error.message;



if(!output)
output="✅ Completed";



sendOutput(
chatId,
output
);


});


});





async function sendOutput(chatId,text){


const limit=4000;


while(text.length>limit){


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
