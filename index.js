import "dotenv/config";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createTicket, closeTicket } from "./tickets.js";
import { initDatabase } from "./db.js";
import { sendWelcomeMessage } from "./welcome.js";
import { handleEmbedModalSubmit } from "./commands/embed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  // GuildMembers is a privileged intent: it must also be enabled in the
  // Discord Developer Portal under Bot -> Privileged Gateway Intents.
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// --- Load slash commands automatically from the "commands" folder ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = pathToFileURL(path.join(commandsPath, file)).href;
  const command = await import(filePath);
  client.commands.set(command.data.name, command);
}

// --- Bot is online ---
client.once("clientReady", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  await initDatabase();
});

// --- Welcome new members ---
client.on("guildMemberAdd", async (member) => {
  await sendWelcomeMessage(member);
});

// --- Handle all interactions (slash commands, buttons, modals) ---
client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === "create_ticket_support") {
        await createTicket(interaction, "support");
        return;
      }
      if (interaction.customId === "create_ticket_work") {
        await createTicket(interaction, "work");
        return;
      }
      if (interaction.customId === "close_ticket") {
        await closeTicket(interaction);
        return;
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("embed_modal_")) {
        await handleEmbedModalSubmit(interaction);
        return;
      }
    }
  } catch (error) {
    console.error(error);
    const errorMessage = {
      content: "Something went wrong while handling this.",
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage).catch(() => null);
    } else {
      await interaction.reply(errorMessage).catch(() => null);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
