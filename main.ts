import config from "./config/config.json" with { type: "json" };
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} from "npm:discord.js";
import { bold, brightBlue } from "jsr:@std/fmt/colors";
import { join } from "jsr:@std/path";

const token = config.discord.token;
const clientId = config.discord.clientId;
const guildId = config.discord.guildId; // Optional: only for testing in a specific guild

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

client.once(Events.ClientReady, (readyClient) => {
  console.log(
    bold(brightBlue(`Clefairy is running as ${readyClient.user.tag}`)),
  );
});

const commands = [];
const foldersPath = join(Deno.cwd(), "commands");
const commandFolders = [...Deno.readDirSync(foldersPath)].filter((entry) =>
  entry.isDirectory
);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder.name);
  const commandFiles = [...Deno.readDirSync(commandsPath)].filter((entry) =>
    entry.isFile && entry.name.endsWith(".ts")
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file.name);

    try {
      const command = await import(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
        );
      }
    } catch (error) {
      console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    if (guildId) {
      console.log(
        `Started refreshing ${commands.length} guild (/) commands for guild ID ${guildId}.`,
      );
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(
        `Successfully reloaded ${data.length} guild application (/) commands.`,
      );
    } else {
      console.log(
        `Started refreshing ${commands.length} global application (/) commands.`,
      );
      const data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log(
        `Successfully reloaded ${data.length} global application (/) commands.`,
      );
    }
  } catch (error) {
    console.error("Error registering commands:", error);
  }
})();

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(token);
