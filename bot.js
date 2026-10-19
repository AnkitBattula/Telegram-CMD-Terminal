require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { exec } = require("child_process");


const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
});


console.log("🚀 Telegram Terminal Bot Started");


// Send Alive message when bot starts
if (process.env.ALIVE_CHAT_ID) {

    bot.sendMessage(
        process.env.ALIVE_CHAT_ID,
        "🟢 Telegram Terminal Bot is Alive\n\n" +
        "🖥 Server: Render\n" +
        "✅ Status: Online"
    )
    .then(() => {
        console.log("✅ Alive message sent");
    })
    .catch((err) => {
        console.log("❌ Alive message failed:", err.message);
    });

}


// Receive Telegram messages
bot.on("message", (msg) => {

    const chatId = msg.chat.id;
    const command = msg.text;


    if (!command) return;


    console.log(
        `[COMMAND] ${command}`
    );


    bot.sendMessage(
        chatId,
        `⚡ Executing:\n\`\`\`\n${command}\n\`\`\``,
        {
            parse_mode: "Markdown"
        }
    );


    exec(
        command,
        {
            shell: "/bin/bash",
            timeout: 120000,
            maxBuffer: 1024 * 1024 * 20
        },

        (error, stdout, stderr) => {


            let output = "";


            if (stdout)
                output += stdout;


            if (stderr)
                output += "\n\n⚠️ STDERR:\n" + stderr;


            if (error)
                output += "\n\n❌ ERROR:\n" + error.message;


            if (!output)
                output = "✅ Command completed with no output";


            sendOutput(chatId, output);

        }
    );

});


// Send terminal output safely
function sendOutput(chatId, output) {

    const limit = 4000;


    while (output.length > limit) {

        bot.sendMessage(
            chatId,
            "```\n" +
            output.substring(0, limit) +
            "\n```",
            {
                parse_mode: "Markdown"
            }
        );


        output = output.substring(limit);

    }


    bot.sendMessage(
        chatId,
        "```\n" +
        output +
        "\n```",
        {
            parse_mode: "Markdown"
        }
    );

}


// Error logs
bot.on("polling_error", (error) => {

    console.log(
        "Polling Error:",
        error.message
    );

});
