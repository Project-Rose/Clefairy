import config from "./config/config.json";
import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
} from "discord.js";
import path from "path";
import chalk from "chalk"; // replace with chalk for colors
import fs from 'fs';

console.log(chalk.bgWhite.bold.black("[STARTED] Started Clefairy - The Amazing Project Rosé Discord Bot"));
const token = config.discord.token;
const clientId = config.discord.clientId;
const guildId = config.discord.guildId; 

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.commands = new Collection();

const commands = [];
const foldersPath = path.join(process.cwd(), "commands");
const commandFolders = fs.readdirSync(foldersPath).filter((entry) =>
  fs.lstatSync(path.join(foldersPath, entry)).isDirectory()
);

const eventsPath = path.join(process.cwd(), "events");
const eventFiles = fs.readdirSync(eventsPath).filter((entry) =>
  fs.lstatSync(path.join(eventsPath, entry)).isFile() && entry.endsWith(".ts")
);

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  try {
    const eventModule = await import(filePath);
    const event = eventModule.default;

    if (!event || !event.name) {
      console.error(chalk.bold.red(`[ERROR] Failed to load event at ${filePath}:`));
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
      console.log(chalk.bold.green(`[LOADED] Event loaded: ${event.modulename} (once)`));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
      console.log(chalk.bold.green(`[LOADED] Event loaded: ${event.modulename}`));
    }

  } catch (error) {
    console.error(chalk.bold.red(`[ERROR] Failed to load event at ${filePath}:`), error);
  }
}

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((entry) =>
    fs.lstatSync(path.join(commandsPath, entry)).isFile() && entry.endsWith(".ts")
  );

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    try {
      const command = await import(filePath);
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      } else {
        console.log(
          chalk.yellow(`[ALERT] The command at ${filePath} is missing a required "data" or "execute" property.`),
        );
      }
    } catch (error) {
      console.error(chalk.bold.red(`[ERROR] Failed to load command at ${filePath}:`), error);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    if (guildId) {
      console.log(
        chalk.bold.yellow(`[ALERT] Started refreshing ${commands.length} guild (/) commands for guild ID ${guildId}.`),
      );
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(
        chalk.bold.yellow(`[ALERT] Successfully reloaded ${data.length} guild application (/) commands.`),
      );
    } else {
      console.log(
        chalk.bold.yellow(`[ALERT] Started resetting global application (/) commands.`),
      );
      const data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log(
        chalk.bold.yellow(`[ALERT] Successfully reloaded ${data.length} global application (/) commands.`),
      );
    }
  } catch (error) {
    console.error(chalk.bold.red(`[ERROR] Error registering commands:`), error);
  }
})();

client.login(token);
