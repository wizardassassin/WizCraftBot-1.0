import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

// Green 884158152973615105
// Yellow 884158153011376208
// Red 884158153044934666
// Distribution: 15 pos; 5 neut; 5 neg
const responses = [
    ["It is Certain.", "884158152973615105"],
    ["It is decidedly so.", "884158152973615105"],
    ["Without a doubt.", "884158152973615105"],
    ["Yes definitely.", "884158152973615105"],
    ["You may rely on it.", "884158152973615105"],
    ["As I see it, yes.", "884158152973615105"],
    ["Most likely.", "884158152973615105"],
    ["Outlook good.", "884158152973615105"],
    ["Yes.", "884158152973615105"],
    ["Signs point to yes.", "884158152973615105"],
    ["Reply hazy, try again.", "884158153011376208"],
    ["Ask again later.", "884158153011376208"],
    ["Better not tell you now.", "884158153011376208"],
    ["Cannot predict now.", "884158153011376208"],
    ["Concentrate and ask again.", "884158153011376208"],
    ["Don't count on it.", "884158153044934666"],
    ["My reply is no.", "884158153044934666"],
    ["My sources say no.", "884158153044934666"],
    ["Outlook not so good.", "884158153044934666"],
    ["Very doubtful.", "884158153044934666"],
];

export const data = new SlashCommandBuilder()
    .setName("magic8ball")
    .setDescription("It's a Magic 8-Ball!")
    .addStringOption(
        (option) =>
            option
                .setName("question")
                .setDescription(
                    "Your questions to the Magic 8-Ball(Prompts for a question if not provided)."
                )
                .setRequired(true) // Temporary fix
    );
export async function execute(interaction) {
    let question = interaction.options.getString("question");

    if (question) {
        let embed = createEmbed(question);
        await interaction.reply({ embeds: [embed] });
        return;
    }

    // not functional atm
    return;
    // If a question was not provided.
    await interaction.reply("Please enter in a question.");
    const filter = (m) => interaction.user.id === m.author.id;

    try {
        console.log("asd");
        const messages = await interaction.channel.awaitMessages({
            filter,
            time: 30000,
            max: 1,
            errors: ["time"],
        });
        console.log("asd");
        question = messages.first().content;
        let embed = createEmbed(question);
        await interaction.followUp({ embeds: [embed] });
        return;
    } catch {
        await interaction.followUp("You did not enter any input!");
    }
}

function createEmbed(question) {
    let value = Math.floor(Math.random() * responses.length);
    let [reply, icon] = responses[value];
    const url = `https://cdn.discordapp.com/emojis/${icon}.png`;
    let embed = new EmbedBuilder()
        .setTitle("Magic 8-Ball")
        .addFields([
            { name: "Question", value: String(question) },
            { name: "Response", value: String(reply) },
        ])
        .setColor(0xf1c40f)
        .setThumbnail(url)
        .setTimestamp()
        .setFooter({ text: "Have a nice day!", iconURL: url });
    return embed;
}
