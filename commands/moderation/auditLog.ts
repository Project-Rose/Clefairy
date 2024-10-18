import {
  ChatInputCommandInteraction,
  GuildAuditLogsEntry,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("auditlog")
  .setDescription("Shows audit log entries for someone.")
  .addIntegerOption((option) =>
    option.setName("limit")
      .setDescription("Number of audit log entries to display (default is 5)")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild?.members.me?.permissions.has("ViewAuditLog")) {
    await interaction.reply({
      content:
        "I don't have permission to view audit logs! you goof convex polygon",
      ephemeral: true,
    });
    return;
  }

  const limit = interaction.options.getInteger("limit") || 5;

  try {
    const auditLogs = await interaction.guild.fetchAuditLogs({ limit });
    const logEntries = auditLogs.entries.map((entry: GuildAuditLogsEntry) => {
      const { executor, target, action, reason } = entry;
      const targetType = target ? (target as any).tag || target.id : "Unknown";
      return `**Action:** ${action}\n**Executor:** ${executor?.tag}\n**Target:** ${targetType}\n**Reason:** ${
        reason || "No reason provided"
      }\n`;
    });

    if (logEntries.length === 0) {
      await interaction.reply({
        content: "This dude or gurl has done nothing notable i'm sorry.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: logEntries.join("\n\n"),
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content:
        "I couldn't fetch audit logs for some goddamm reason. Please try again!",
      ephemeral: true,
    });
  }
}
