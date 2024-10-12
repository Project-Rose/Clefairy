import { SlashCommandBuilder, GuildMember } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js'; // Import specific type for interaction if needed

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription("Drops the ban hammer into someone's head")
  .addUserOption(option => 
    option.setName('user')
      .setDescription("The hammer's target")
      .setRequired(true))
  .addStringOption(option => 
    option.setName('reason')
      .setDescription('The reason for such drastic action')
      .setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {

  const targetUser = interaction.options.getUser('user', true); 
  const reason = interaction.options.getString('reason') || 'No reason provided';


  if (!interaction.memberPermissions?.has('BanMembers')) {
    return interaction.reply({ content: 'You do not have permission to ban members, goof cylinder!', ephemeral: true });
  }

  const member: GuildMember | null = await interaction.guild?.members.fetch(targetUser.id).catch(() => null);

  if (!member) {
    return interaction.reply({ content: 'User not found in the server!', ephemeral: true });
  }

  try {
    await member.ban({ reason });
    await interaction.reply({ content: `${targetUser.tag} has been banned for: ${reason}` });
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: `Failed to ban ${targetUser.tag}.`, ephemeral: true });
  }
}
