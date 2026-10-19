require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { exec } = require("child_process");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
});


console.log("✅ Telegram Terminal Bot running on Render");


bot.on("message", (msg) => {

    const chatId = msg.chat.id;
    const command = msg.text;


    if (!command) return;


    console.log("Command:", command);


    exec(
        command,
        {
            shell: "/bin/bash",
            timeout: 120000,
            maxBuffer: 1024 * 1024 * 20
        },

        (error, stdout, stderr) => {


            let result = "";


            if (stdout)
                result += stdout;


            if (stderr)
                result += "\nSTDERR:\n" + stderr;


            if (error)
                result += "\nERROR:\n" + error.message;


            if (!result)
                result = "✅ Done";


            sendOutput(chatId, result);

        }
    );

});


function sendOutput(chatId, text) {

    const size = 4000;


    while(text.length > size){

        bot.sendMessage(
            chatId,
            "```\n"+text.substring(0,size)+"\n```",
            {
                parse_mode:"Markdown"
            }
        );

        text=text.substring(size);

    }


    bot.sendMessage(
        chatId,
        "```\n"+text+"\n```",
        {
            parse_mode:"Markdown"
        }
    );

}
