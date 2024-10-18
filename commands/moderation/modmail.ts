import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import * as config from "../../config/config.json" with { type: "json" };

export const data = new SlashCommandBuilder()
  .setName("modmail")
  .setDescription(
    "Start a modmail conversation with a user. ONLY MEANT FOR MODS",
  )
  .addUserOption((option) =>
    option.setName("user")
      .setDescription("The user to contact")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("user");
  const guild = interaction.guild;

  if (!interaction.member.roles.cache.has(config.default.discord.modRoleId)) {
    await interaction.reply({
      content: "You do not have permission to use this command. goof triangle!",
      ephemeral: true,
    });
    return;
  }

  if (!guild) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
    return;
  }

  const randomString = Math.random().toString(36).substring(2, 8);
  const channelName = `modmail-${targetUser.id}-${randomString}`;

  const modmailChannel = await guild.channels.create(channelName, {
    type: "GUILD_TEXT",
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.SendMessages],
      },
      {
        id: targetUser.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ],
      },
      {
        id: config.default.discord.modRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ],
      },
    ],
  });

  await targetUser.send(
    `Hello! The Project Rosé mod team wants to talk to you. This conversation won't be recorded and will be deleted if you type "!end" or if the team decides to end it.`,
  );
  await interaction.reply({
    content: `Modmail channel created: ${modmailChannel}.`,
    ephemeral: true,
  });

  const filter = (message) =>
    message.content === "!end" &&
    (message.author.id === targetUser.id ||
      message.member?.roles.cache.has(config.default.discord.modRoleId));

  const collector = modmailChannel.createMessageCollector({ filter });

  collector.on("collect", async (message) => {
    if (message.author.id === targetUser.id) {
      await guild.channels.cache.get(config.default.discord.devChatId)?.send(
        `${targetUser.tag} has decided to end the convo.`,
      );
      await modmailChannel.send(
        `This conversation has ended. Any more messages sent here won't be recorded nor sent to the mod team until another convo begins.`,
      );
    } else {
      await modmailChannel.send(
        `This conversation has ended. Any more messages sent here won't be recorded nor sent to the mod team until another convo begins.`,
      );
    }
    collector.stop();
    await modmailChannel.delete();
  });
}
