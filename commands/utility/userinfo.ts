import { SlashCommandBuilder, GuildMember } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Displays information about a user.')
  .addUserOption(option => 
    option.setName('user')
      .setDescription('The user to get information about')
      .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('user', true);
  const member: GuildMember | null = await interaction.guild?.members.fetch(targetUser.id).catch(() => null);

  if (!member) {
    return interaction.reply({ content: 'User not found in the server, goof triangle!', ephemeral: true });
  }

  await interaction.reply({
    content: `**User Info:**
    - Username: ${targetUser.tag}
    - ID: ${targetUser.id}
    - Joined server: ${member.joinedAt?.toDateString()}
    - Roles: ${member.roles.cache.map(role => role.name).join(', ')}`
  });
}
