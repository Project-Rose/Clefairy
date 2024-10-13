import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('mii')
  .setDescription('Fetch a Mii using the Mii-Unsecure API (WIP)')
  .addStringOption(option => 
    option.setName('pnid')
      .setDescription('The PNID of the Mii to fetch. Leave blank if using NNID.')
      .setRequired(false))
  .addStringOption(option =>
    option.setName('nnid')
      .setDescription('The NNID of the Mii to fetch. Leave blank if using PNID.')
      .setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
    const miinnid: string | null = interaction.options.getString('nnid'); 
    const miipnid: string | null = interaction.options.getString('pnid'); 
    
    let nid: string | null = null;
    let api_id: number | undefined;


    if (miipnid && !miinnid) {
        api_id = 1; // Using PNID
        nid = miipnid;
    } else if (miinnid && !miipnid) {
        api_id = 0; // Using NNID
        nid = miinnid;
    } else {
        return await interaction.reply({ content: "Please enter either a PNID or NNID.", ephemeral: true });
    }

    // Endpoints
    const miiImageURL = `https://mii-unsecure.ariankordi.net/miis/image.png?nnid=${nid}&api_id=${api_id}&type=face&width=270`;
    const miiDataURL = `https://mii-unsecure.ariankordi.net/mii_data/${nid}?api_id=${api_id}`;
    
    try {
        const [imageResponse, dataResponse] = await Promise.all([
            fetch(miiImageURL),
            fetch(miiDataURL)
        ]);

        if (!imageResponse.ok) {
            return await interaction.reply({ content: "I couldn't fetch your silly Mii. Please try again.", ephemeral: true });
        }

        if (!dataResponse.ok) {
            return await interaction.reply({ content: "I couldn't fetch your silly Mii. Please try again.", ephemeral: true });
        }

        const imageStream = imageResponse.body;
        const attachment = new AttachmentBuilder(imageStream, { name: "mii.png" });

        const miiData = await dataResponse.json();
        const { data, pid, images, studio_url_data, ...filteredData } = miiData;

        // Mapping for prettier names
        const prettyNames: { [key: string]: string } = {
            name: 'Name',
            user_id: 'ID',
        };

        const embed = new EmbedBuilder()
            .setColor('#0099ff') 
            .setTitle(`${nid}'s Mii`)
            .setDescription(`Here are the details for your Mii:`)
            .setThumbnail('attachment://mii.png'); 

        for (const [key, value] of Object.entries(filteredData)) {
            const prettyKey = prettyNames[key] || key; 
            embed.addFields({ name: prettyKey, value: String(value), inline: true });
        }

        await interaction.reply({ embeds: [embed], files: [attachment] });
        
    } catch (error) {
        console.error("Error fetching Mii:", error);
        await interaction.reply({ content: "An error occurred while fetching your Mii. Please try again later.", ephemeral: true });
    }
}
