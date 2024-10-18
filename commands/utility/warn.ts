import {
  type ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("Warns someone of their silly misbehaviors")
  .addUserOption((option) =>
    option.setName("user")
      .setDescription("THE TARGET")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("reason")
      .setDescription("His silly misbehavior")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const warnedUser = interaction.options.getMember("user");
  let warnReason: string | null = interaction.options.getString("reason");
  if (!warnReason) {
    warnReason = "No reason apparently. LAME.";
  }

  if (!interaction.member.permissions.has("MODERATE_MEMBERS")) {
    return interaction.reply({
      content: "You can't do that, goof ball.",
      ephemeral: true,
    });
  }

  if (!interaction.guild.members.me.permissions.has("MODERATE_MEMBERS")) {
    return interaction.reply({
      content: "I don't have permission to warn members.",
      ephemeral: true,
    });
  }

  try {
    await warnedUser.send(`You Got Warned: ${warnReason}`);
    await interaction.reply({
      content: "Warn succesfully delivered to said TARGET. Have a nice day!",
      ephemeral: true,
    });
  } catch (error) {
    await interaction.reply({
      content:
        "I couldn't warn the member because they had DMs disabled ig so i'm going to resort to public shaming!",
      ephemeral: true,
    });
    await interaction.channel.send(
      `${warnedUser} Got Warned BUUUT he didn't have DMs opened so i'm here to tell him: ${warnReason}`,
    );
  }
}
