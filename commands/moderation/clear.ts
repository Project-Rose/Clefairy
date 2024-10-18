import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription(
    "Reduce a specified number of messages from the channel to atoms",
  )
  .addIntegerOption((option) =>
    option.setName("amount")
      .setDescription("The number of messages to nuke")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger("amount", true);

  if (!interaction.memberPermissions?.has("ManageMessages")) {
    return interaction.reply({
      content:
        "You do not have permission to manage messages, you are such a goof ball!",
      ephemeral: true,
    });
  }

  if (amount < 1 || amount > 100) {
    return interaction.reply({
      content: "You need to enter a number between 1 and 100.",
      ephemeral: true,
    });
  }

  const channel = interaction.channel;

  if (channel?.isTextBased()) {
    try {
      await channel.bulkDelete(amount, true); // true to filter system/pinned messages
      await interaction.reply({
        content: `Successfully nuked ${amount} messages.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content:
          "There was an error trying to reduce the messages in this channel to atoms!",
        ephemeral: true,
      });
    }
  }
}
