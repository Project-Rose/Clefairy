import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unban")
  .setDescription("Forgives someone's silly misbehaves")
  .addUserOption((option) =>
    option.setName("user")
      .setDescription("The one to be forgiven")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const unbannedUser = interaction.options.getUser("user");

  switch (!interaction.memberPermissions?.has("BanMembers")) {
    case true:
      break;
    default:
      interaction.reply({
        content: "You do not have permission to unban members, goof cylinder!",
        ephemeral: true,
      });
      break;
  }

  const member: GuildMember | null = await interaction.guild?.members.fetch(
    unbannedUser.id,
  ).catch(() => null);

  switch (!member) {
    case true:
      interaction.reply({
        content: "bro there's no one with this name here are you crazy?",
        ephemeral: true,
      });
      break;

    default:
      break;
  }

  try {
    member?.guild.members.unban;
    await interaction.reply({
      content:
        `I've successfully forgiven ${unbannedUser.tag}, he can come back now.`,
      ephemeral: false,
    });
    const invite = await interaction.guild.invites.create(
      interaction.channelId,
      {
        maxAge: 0, // 0 means the invite never expires
        maxUses: 1, // 1 means it can only be used once
      },
    );
    member?.send(
      `"I've forgiven you (in another words, you've been unbanned), you can finally come back! Here's your invite ${invite}`,
    );
  } catch (error) {
    await interaction.reply({
      content:
        `I couldn't unban the said person either because i can't or because the person hasn't been banned idk`,
      ephemeral: true,
    });
  }
}
