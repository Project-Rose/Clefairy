import { SlashCommandBuilder, PermissionsBitField, TextChannel } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Locks the current channel so no one can send messages.');

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has('ManageChannels')) {
    return interaction.reply({ content: 'You do not have permission to lock channels, goof square!', ephemeral: true });
  }

  const channel = interaction.channel as TextChannel;

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SendMessages: false,
    });
    await interaction.reply({ content: 'Channel has been locked.' });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Failed to lock the channel.', ephemeral: true });
  }
}
