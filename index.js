import "dotenv/config";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createTicket, closeTicket } from "./tickets.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// --- Slash commands automatisch inladen uit de map "commands" ---
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
client.once("clientReady", () => {
  console.log(`✅ Ingelogd als ${client.user.tag}`);
});

// --- Alle interacties afhandelen (slash commands + knoppen) ---
client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === "create_ticket") {
        await createTicket(interaction);
        return;
      }
      if (interaction.customId === "close_ticket") {
        await closeTicket(interaction);
        return;
      }
    }
  } catch (error) {
    console.error(error);
    const errorMessage = {
      content: "Er ging iets mis bij het uitvoeren hiervan.",
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
