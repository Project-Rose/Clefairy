import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { Buffer } from 'npm:buffer';  // Import Node's Buffer

export const data = new SlashCommandBuilder()
  .setName('mii')
  .setDescription('Fetches a Mii using the Mii-Unsecure API (WIP)')
  .addStringOption(option => 
    option.setName('pnid')
      .setDescription('The PNID (Pretendo Network ID) of the Mii you want to fetch.')
      .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
    const miipnid = interaction.options.getString('pnid', true);
    const miiURL = `https://mii-unsecure.ariankordi.net/miis/image.png?nnid=${miipnid}&api_id=1&type=face&width=270`;
    
    try {
        const imageResponse = await fetch(miiURL);
  
        if (imageResponse.ok) {
            const arrayBuffer = await imageResponse.arrayBuffer(); // Fetch image as ArrayBuffer
            const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Node's Buffer

            const attachment = new AttachmentBuilder(buffer, { name: "mii.png" }); // Use Buffer in AttachmentBuilder

            await interaction.reply({ content: "Here is your silly Mii!", files: [attachment] });
        } else {
            await interaction.reply({ content: "Your Mii is way too silly for me to fetch or it doesn't exists ouside your head. Please try again.", ephemeral: true });
        }
    } catch (error) {
        console.error("Error fetching Mii:", error);
        await interaction.reply({ content: "An error occurred while fetching this Mii.", ephemeral: true });
    }
}
