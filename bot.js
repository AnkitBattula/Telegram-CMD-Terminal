require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { exec } = require("child_process");


// Environment check
if (!process.env.BOT_TOKEN) {
    console.error("❌ BOT_TOKEN missing");
    process.exit(1);
}


const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: {
        interval: 1000,
        autoStart: true
    }
});


console.log("🚀 Telegram Terminal Bot Started");


// Alive notification
async function sendAlive() {

    if (!process.env.ALIVE_CHAT_ID) {
        console.log("⚠️ ALIVE_CHAT_ID not set");
        return;
    }


    try {

        await bot.sendMessage(
            process.env.ALIVE_CHAT_ID,
            "🟢 Telegram Terminal Bot is Alive\n\n" +
            "🖥 Server: Render\n" +
            "✅ Status: Online"
        );


        console.log("✅ Alive message sent");

    } catch (err) {

        console.log(
            "Alive message error:",
            err.message
        );

    }

}


setTimeout(sendAlive, 3000);



// Receive Telegram commands
bot.on("message", async (msg) => {


    const chatId = msg.chat.id;
    const command = msg.text;


    if (!command) return;


    console.log(
        `[${new Date().toISOString()}] CMD: ${command}`
    );



    try {


        await bot.sendMessage(
            chatId,
            `⚡ Executing:\n${command}`
        );



        exec(
            command,
            {
                shell: "/bin/bash",
                timeout: 120000,
                maxBuffer: 50 * 1024 * 1024
            },


            async (error, stdout, stderr) => {


                let output = "";



                if (stdout) {
                    output += stdout;
                }


                if (stderr) {
                    output +=
                    "\n\n⚠️ STDERR:\n" +
                    stderr;
                }


                if (error) {
                    output +=
                    "\n\n❌ ERROR:\n" +
                    error.message;
                }


                if (!output.trim()) {

                    output =
                    "✅ Command completed\n(No output)";

                }



                await sendOutput(
                    chatId,
                    output
                );


            }
        );


    } catch(err) {


        bot.sendMessage(
            chatId,
            "❌ Bot error:\n" + err.message
        );


    }


});




// Send output safely
async function sendOutput(chatId, text) {


    const limit = 4000;


    while(text.length > limit) {


        await bot.sendMessage(
            chatId,
            text.substring(0, limit)
        );


        text =
        text.substring(limit);


    }



    await bot.sendMessage(
        chatId,
        text
    );


}




// Telegram errors
bot.on(
    "polling_error",
    (err)=>{

        console.log(
            "Polling Error:",
            err.message
        );

    }
);



// Shutdown handling
process.on(
    "SIGINT",
    ()=>{
        console.log("Stopping bot...");
        bot.stopPolling();
        process.exit();
    }
);


process.on(
    "SIGTERM",
    ()=>{
        console.log("Stopping bot...");
        bot.stopPolling();
        process.exit();
    }
);
