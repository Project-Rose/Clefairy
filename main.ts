import config from "./config/config.json" with { type: "json" };
import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
} from "npm:discord.js";
import { join } from "jsr:@std/path";
import { brightRed, brightGreen, bold, brightYellow, brightBlack, bgWhite } from "jsr:@std/fmt/colors";

console.log(bgWhite(bold(brightBlack("[STARTED] Started Clefairy - The Amazing Project Rosé Discord Bot"))));
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
const foldersPath = join(Deno.cwd(), "commands");
const commandFolders = [...Deno.readDirSync(foldersPath)].filter((entry) =>
  entry.isDirectory
);

const eventsPath = join(Deno.cwd(), "events");
const eventFiles = [...Deno.readDirSync(eventsPath)].filter((entry) =>
  entry.isFile && entry.name.endsWith(".ts") 
);

for (const file of eventFiles) {
  const filePath = join(eventsPath, file.name);
  try {
    const eventModule = await import(filePath);
    const event = eventModule.default;

    if (!event || !event.name) {
      console.error(bold(brightRed(`[ERROR] Failed to load event at ${filePath}:`)));
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
      console.log(bold(brightGreen(`[LOADED] Event loaded: ${event.modulename} (once)`)));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
      console.log(bold(brightGreen(`[LOADED] Event loaded: ${event.modulename}`)));
    }

  } catch (error) {
    console.error(bold(brightRed(`[ERROR] Failed to load event at ${filePath}:`)), error);
  }
}

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
          bold(yellow(`[ALERT] The command at ${filePath} is missing a required "data" or "execute" property.`)),
        );
      }
    } catch (error) {
      console.error(bold(brightRed(`[ERROR] Failed to load command at ${filePath}:`)), error);
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    if (guildId) {
      console.log(
        bold(brightYellow(`[ALERT] Started refreshing ${commands.length} guild (/) commands for guild ID ${guildId}.`)),
      );
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(
        bold(brightYellow(`[ALERT] Successfully reloaded ${data.length} guild application (/) commands.`)),
      );
    } else {
      console.log(
        (bold(brightYellow(`[ALERT] Started resetting global application (/) commands.`))),
      );
      const data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log(
        bold(brightYellow(`[ALERT] Successfully reloaded ${data.length} global application (/) commands.`)),
      );
    }
  } catch (error) {
    console.error(bold(brightRed(`[ERROR] Error registering commands:`)), error);
  }
})();

client.login(token);
