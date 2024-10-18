import { Events, ModalSubmitFields, PermissionFlagsBits } from "discord.js";
import * as config from "../config/config.json" with {type: "json"};

export default {
  modulename : "Mod-Mail Event Listener",
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot || message.guild) return;

    const client = message.client;
    const guild = await client.guilds.fetch(config.default.discord.guildId);
    const randomString = Math.random().toString(36).substring(2, 8);
    const channelName = `modmail-${message.author.id}-${randomString}`;

    const modmailChannel = await guild.channels.create(channelName, {
      type: "GUILD_TEXT",
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.SendMessages],
        },
        {
          id: message.author.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        {
          id: config.default.discord.modRoleId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
      ],
    });

    await message.author.send(`Hello! The Project Rosé mod team wants to talk to you. This conversation won't be recorded and will be deleted if you type "!end" or if the team decides to end it.`);

    const filter = (msg) => msg.content === "!end" && (msg.author.id === message.author.id || msg.member?.roles.cache.has(config.default.discord.modRoleId));

    const collector = modmailChannel.createMessageCollector({ filter });

    collector.on("collect", async (msg) => {
      if (msg.author.id === message.author.id) {
        await guild.channels.cache.get(config.default.discord.devChatId)?.send(`${message.author.tag} has decided to end the convo.`);
      }
      await modmailChannel.send(`This conversation has ended. Any more messages sent here won't be recorded nor sent to the mod team until another convo begins.`);
      collector.stop();
      await modmailChannel.delete();
    });
  },
};
