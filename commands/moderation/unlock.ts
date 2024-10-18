import {
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unlock")
  .setDescription(
    "Unlocks the current channel so everyone can send messages again.",
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has("ManageChannels")) {
    return interaction.reply({
      content: "You do not have permission to unlock channels, goof hypercube!",
      ephemeral: true,
    });
  }

  const channel = interaction.channel as TextChannel;

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SendMessages: true,
    });
    await interaction.reply({ content: "Channel has been unlocked." });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Failed to unlock the channel.",
      ephemeral: true,
    });
  }
}
