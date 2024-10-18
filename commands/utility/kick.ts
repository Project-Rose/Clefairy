import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kicks a user's butt from the server")
  .addUserOption((option) =>
    option.setName("user")
      .setDescription("The user to kick")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("reason")
      .setDescription("Reason for the kick")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") ||
    "No reason provided";

  if (!interaction.memberPermissions?.has("KickMembers")) {
    return interaction.reply({
      content: "You do not have permission to kick members, goof sphere!",
      ephemeral: true,
    });
  }

  const member: GuildMember | null = await interaction.guild?.members.fetch(
    targetUser.id,
  ).catch(() => null);

  if (!member) {
    return interaction.reply({
      content: "User not found in the server, schizo!",
      ephemeral: true,
    });
  }

  try {
    await member.kick(reason);
    await interaction.reply({
      content: `${targetUser.tag} has been kicked for: ${reason}`,
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: `Failed to kick ${targetUser.tag}.`,
      ephemeral: true,
    });
  }
}
