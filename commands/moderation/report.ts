import {
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import * as config from "../../config/config.json" with { type: "json" };

export const data = new SlashCommandBuilder()
  .setName("report")
  .setDescription("Reports someone's misbehaviors")
  .addUserOption((option) =>
    option.setName("user")
      .setDescription("The mischievous person in question")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("reason")
      .setDescription(
        "The reason for your report, what the person in question has done",
      )
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const reportedUser = interaction.options.getUser("user");
  const reason = interaction.options.getString("reason");

  if (!reportedUser || !reason) {
    await interaction.reply({
      content: "Please provide all required fields!",
      ephemeral: true,
    });
    return;
  }

  const reportChannel = interaction.guild?.channels.cache.get(
    config.discord.reportChannelId,
  ) as TextChannel;

  if (reportChannel && reportChannel.type === ChannelType.GuildText) {
    const reportMessage =
      `**User:** ${reportedUser.tag}\n**Reported by:** ${interaction.user.tag}\n**Reason:** ${reason}`;

    await reportChannel.send({ content: reportMessage });
    await interaction.reply({
      content:
        "Thank you! Your report has been submitted to the moderation team.",
      ephemeral: true,
    });
  } else {
    await interaction.reply({
      content:
        "Error: Report channel not found or is not a text channel. Please contact the moderation team.",
      ephemeral: true,
    });
  }
}
