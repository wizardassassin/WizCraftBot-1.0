import {
    ChatInputCommandInteraction,
    Collection,
    SlashCommandBuilder,
} from "discord.js";
import fs from "fs";
import { dirname } from "path";
import { SubcommandGroupModule } from "types/common/discord.js";
import { fileURLToPath } from "url";

const data = new SlashCommandBuilder()
    .setName("integration")
    .setDescription("Integrates with external applications.");

const cwd = dirname(fileURLToPath(import.meta.url));

const subcommandGroups = new Collection<string, SubcommandGroupModule>();

const subcommandGroupFolders = fs
    .readdirSync(cwd)
    .filter((folder) => fs.lstatSync(`${cwd}/${folder}`).isDirectory());

for (const subcommandGroupFolder of subcommandGroupFolders) {
    // Assuming that there's only one subcommandGroup handler per subcommandGroupFolder
    const subcommandGroupFile = fs
        .readdirSync(`${cwd}/${subcommandGroupFolder}`)
        .filter((file) => file.endsWith(".js"))[0];
    const subcommandGroup = await import(
        `./${subcommandGroupFolder}/${subcommandGroupFile}`
    );
    subcommandGroups.set(subcommandGroup.data.name, subcommandGroup);
    data.addSubcommandGroup(subcommandGroup.data);
}

export { data };

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommandGroupName = interaction.options.getSubcommandGroup();
    const subcommandGroup = subcommandGroups.get(subcommandGroupName);

    if (!subcommandGroup) return;

    try {
        subcommandGroup.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was an error while executing this SubcommandGroup!",
            ephemeral: true,
        });
    }
}
