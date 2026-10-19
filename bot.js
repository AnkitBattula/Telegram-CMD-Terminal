require("dotenv").config();

const TelegramBot = require("node-telegram-api-bot");
const { exec } = require("child_process");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
});


console.log("🚀 Telegram Terminal Bot Online");


// Send Alive message
setTimeout(() => {

    if (process.env.ALIVE_CHAT_ID) {

        bot.sendMessage(
            process.env.ALIVE_CHAT_ID,
            "🟢 Telegram Terminal Bot is Alive\n\n" +
            "🖥 Server: Render\n" +
            "✅ Status: Online"
        )
        .then(() => console.log("Alive message sent"))
        .catch(err => console.log("Alive error:", err.message));

    }

}, 3000);



bot.on("message", async (msg) => {

    const chatId = msg.chat.id;
    const command = msg.text;


    if (!command) return;


    console.log(
        `📩 Command from ${chatId}: ${command}`
    );


    await bot.sendMessage(
        chatId,
        `⚡ Executing:\n${command}`
    );


    exec(
        command,
        {
            shell: "/bin/bash",
            timeout: 120000,
            maxBuffer: 1024 * 1024 * 50
        },


        async (error, stdout, stderr) => {


            let result = "";


            if (stdout) {
                result += stdout;
            }


            if (stderr) {
                result += "\n\n⚠️ STDERR:\n" + stderr;
            }


            if (error) {
                result += "\n\n❌ ERROR:\n" + error.message;
            }


            if (result.trim() === "") {
                result = "✅ Command completed successfully";
            }


            await sendOutput(
                chatId,
                result
            );

        }
    );

});



// Send long outputs
async function sendOutput(chatId, text) {

    const limit = 4000;


    while(text.length > limit) {

        await bot.sendMessage(
            chatId,
            text.substring(0, limit)
        );

        text = text.substring(limit);

    }


    await bot.sendMessage(
        chatId,
        text
    );

}



// Error monitoring
bot.on(
    "polling_error",
    (error)=>{

        console.log(
            "Polling Error:",
            error.message
        );

    }
);
