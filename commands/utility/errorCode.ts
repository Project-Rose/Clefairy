import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import wiiuSupportCodes from "../libs/support-codes/index.cjs";

const WIIU_SUPPORT_CODE_REGEX = /(\b1\d{2}-\d{4}\b)/gm;

/**
 * Check for Wii U error code in the provided text.
 * @param {String} text
 */
function checkForErrorCode(text: string) {
  const wiiuMatch = text.match(WIIU_SUPPORT_CODE_REGEX);
  if (wiiuMatch) {
    return getWiiUSupportCodeInfo(wiiuMatch[0]);
  }

  return null; // No error code found
}

function getWiiUSupportCodeInfo(supportCode: string) {
  const [moduleId, descriptionId] = supportCode.split("-");
  const mod = wiiuSupportCodes[moduleId];

  if (!mod || !mod.codes[descriptionId]) {
    return;
  }

  const code = mod.codes[descriptionId];
  const embed = new EmbedBuilder()
    .setColor(0x009AC7)
    .setTitle(`${supportCode} (Wii U)`)
    .setDescription(
      "Wii U support code detected\nInformation is WIP and may be missing/incorrect",
    )
    .addFields([
      { name: "Module Name", value: mod.name, inline: true },
      { name: "Module Description", value: mod.description, inline: true },
      { name: "Error Name", value: `\`${code.name}\``, inline: true },
      { name: "Error Description", value: code.description, inline: true },
      { name: "Fix", value: code.fix || "N/A" },
      {
        name: "Console dialog message",
        value: `\`\`\`\n${code.message}\n\`\`\``,
      },
    ]);

  if (code.link && code.link !== "Missing link") {
    embed.setURL(code.link);
  }

  return embed;
}

// Exporting the command
export const data = new SlashCommandBuilder()
  .setName("checkerror")
  .setDescription("Check for Wii U support error codes in the provided text.")
  .addStringOption((option) =>
    option.setName("code")
      .setDescription("The error code you want to fetch")
      .setRequired(true)
  );

export const execute = async (interaction) => {
  const text = interaction.options.getString("text");
  const embed = checkForErrorCode(text);

  if (embed) {
    await interaction.reply({ embeds: [embed] });
  } else {
    await interaction.reply({
      content: "Please enter a code and try again",
      ephemeral: true,
    });
  }
};
