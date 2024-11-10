import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { encryptAesCcm } from "../../libs/mii.cjs";
import * as QRCode from "qrcode";
import { Buffer } from "buffer";

export const data = new SlashCommandBuilder()
  .setName("mii")
  .setDescription("Fetch a Mii using the Mii-Unsecure API")
  .addStringOption((option) =>
    option.setName("render")
      .setDescription(
        "Select the render you want to use (default: Wii U/Miiverse).",
      )
      .setRequired(true)
      .addChoices(
        { name: "Wii U/Miiverse", value: "wiiu" },
        { name: "Switch", value: "switch" },
        { name: "Miitomo", value: "miitomo" },
        { name: "Blinn (Wii Kareoke U render)", value: "blinn"}
      )
  )
  .addStringOption((option) =>
    option.setName("expression")
      .setDescription(
        "Select the expression you want to use (default: Normal).",
      )
      .setRequired(true)
      .addChoices(
        { name: "Normal", value: "normal" },
        { name: "Smile", value: "smile" },
        { name: "Anger", value: "anger" },
        { name: "Sorrow", value: "sorrow" },
        { name: "Surprise", value: "surprise" },
        { name: "Blink", value: "blink" },
        { name: "Normal (open mouth)", value: "normal_open_mouth" },
        { name: "Smile (open mouth)", value: "smile_open_mouth" },
        { name: "Anger (open mouth)", value: "anger_open_mouth" },
        { name: "Surprise (open mouth)", value: "surprise_open_mouth" },
        { name: "Sorrow (open mouth)", value: "sorrow_open_mouth" },
        { name: "Blink (open mouth)", value: "blink_open_mouth" },
        { name: "Wink (left eye open)", value: "wink_left" },
        { name: "Wink (right eye open)", value: "wink_right" },
        {
          name: "Wink (left eye and mouth open)",
          value: "wink_left_open_mouth",
        },
        {
          name: "Wink (right eye and mouth open)",
          value: "wink_right_open_mouth",
        },
        { name: "Wink (left eye open and smiling)", value: "like_wink_left" },
        { name: "Wink (right eye open and smiling)", value: "like_wink_right" },
        { name: "Frustrated", value: "frustrated" },
        { name: "🥺", value: "🥺" },
      )
  )
  .addStringOption((option) =>
    option.setName("type")
      .setDescription(
        "Select how your Mii will be positioned (default: Portrait).",
      )
      .setRequired(true)
      .addChoices(
        { name: "Portrait", value: "face" },
        { name: "Head Only", value: "face_only" },
        { name: "Head Only Alt", value: "fflmakeicon" },
        { name: "Whole Body", value: "all_body" },
        { name: "Switch Portrait", value: "variableiconbody" },
      )
  )
  .addStringOption((option) =>
    option.setName("pnid")
      .setDescription(
        "The PNID of the Mii to fetch. Leave blank if using NNID.",
      )
      .setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("nnid")
      .setDescription(
        "The NNID of the Mii to fetch. Leave blank if using PNID.",
      )
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const miinnid = interaction.options.getString("nnid");
  const miipnid = interaction.options.getString("pnid");
  const miiRender = interaction.options.getString("render")!;
  const miiExpression = interaction.options.getString("expression")!;
  const miiType = interaction.options.getString("type")!;

  const nid = miipnid || miinnid;
  const api_id = miipnid ? 1 : 0;

  if (!nid || (miipnid && miinnid)) {
    return interaction.reply({
      content: "Please enter either a PNID or NNID, but not both.",
      ephemeral: true,
    });
  }

  const shaderNumber: number = { blinn: 3, miitomo: 2, switch: 1  }[miiRender] || 3;
  let shaderType: string

  if (miiRender === 'wiiu') {
     shaderType = '';
  } else {
    shaderType = `&shaderType=${shaderNumber}`
  }

  const miiImageURL =
    `https://mii-unsecure.ariankordi.net/miis/image.png?nnid=${nid}&api_id=${api_id}&type=${miiType}&width=1080&expression=${miiExpression}${shaderType}`;
  const miiDataURL =
    `https://mii-unsecure.ariankordi.net/mii_data/${nid}?api_id=${api_id}`;

  try {
    const [imageResponse, dataResponse] = await Promise.all([
      fetch(miiImageURL),
      fetch(miiDataURL),
    ]);

    if (!imageResponse.ok) {
      return interaction.reply({
        content:
          "I couldn't find your Mii, was it all just in your imagination perhaps?.",
        ephemeral: true,
      });
    }

    const imageStream = imageResponse.body;
    const attachment = new AttachmentBuilder(imageStream, { name: "mii.png" });
    const miiData = await dataResponse.json();
    const QrData = miiData.data;

    const miiQrStream = await generateQrCode(QrData);
    const MiiQrAttachment = new AttachmentBuilder(miiQrStream, {
      name: "mii_qr.png",
    });

    const embed = buildMiiEmbed(miiData, api_id);
    await interaction.reply({
      embeds: [embed],
      files: [attachment, MiiQrAttachment],
    });
  } catch (error) {
    console.error("Error fetching Mii:", error);
    await interaction.reply({
      content:
        "Couldn't fetch your sillyyyy Mii for some reason. Please try again.",
      ephemeral: true,
    });
  }
}

async function generateQrCode(data: string) {
  const decodedData = new Uint8Array(Buffer.from(data, "base64"));
  const encrypted = encryptAesCcm(decodedData);
  const qrStream = await QRCode.toBuffer([{ data: encrypted, mode: "byte" }]);
  return qrStream;
}

function buildMiiEmbed(miiData: any, api_id: number) {
  const networkInfo = api_id === 1
    ? {
      idType: "PNID",
      color: "#1b1f3b",
      text: "Environment: Pretendo Network",
      favicon: "https://pretendo.network/assets/images/icons/favicon-32x32.png",
    }
    : {
      idType: "NNID",
      color: "#FF7D00",
      text: "Environment: Nintendo Network",
      favicon:
        "https://media.discordapp.net/attachments/1290013025633304696/1295610730904817684/image.png?ex=670fefc5&is=670e9e45&hm=82d1fd7070057021150928c3410eed859c0feac65aabd30dbe6be6f064ff76ac&=&format=webp&quality=lossless",
    };

  const embed = new EmbedBuilder()
    .setColor(networkInfo.color)
    .setTitle(`${miiData.name}'s Mii`)
    .setDescription("Here are the details for your silly ass Mii.")
    .setThumbnail("attachment://mii.png")
    .setFooter({ text: networkInfo.text, iconURL: networkInfo.favicon });

  const prettyNames = {
    name: "Name",
    user_id: networkInfo.idType,
  };

  const filteredData = (({ name, user_id }) => ({
    name,
    user_id,
  }))(miiData);

  for (const [key, value] of Object.entries(filteredData)) {
    const prettyKey = prettyNames[key] || key;
    embed.addFields({ name: prettyKey, value: String(value), inline: true });
  }

  embed.addFields({ name: "QR Code:", value: "\u200B", inline: false });

  embed.setImage("attachment://mii_qr.png");

  return embed;
}
