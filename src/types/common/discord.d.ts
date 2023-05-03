import {
    Collection,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    ChatInputCommandInteraction,
} from "discord.js";
import { PrismaClient } from "@prisma/client";
import { CronScheduler } from "#utils/cronScheduler.ts";

interface GenericCommandModule {
    readonly data:
        | SlashCommandBuilder
        | SlashCommandSubcommandBuilder
        | SlashCommandSubcommandGroupBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

interface CommandModule extends GenericCommandModule {
    readonly data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

interface SubcommandModule extends GenericCommandModule {
    readonly data: SlashCommandSubcommandBuilder;
}

interface SubcommandGroupModule extends GenericCommandModule {
    readonly data: SlashCommandSubcommandBuilder;
}

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, CommandModule>;
        componentCollectors: Collection<string, string>;
        cronScheduler: CronScheduler;
        prisma: PrismaClient;
        storage: Collection<string, any>;
    }
}
