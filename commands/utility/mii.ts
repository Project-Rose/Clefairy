import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';


export const data = new SlashCommandBuilder()
  .setName('mii')
  .setDescription('Fetch a Mii using the Mii-Unsecure API')
  .addStringOption(option => 
    option.setName('render') 
      .setDescription('Select the render that you want to use. The default one is WiiU/Miiverse.')
      .setRequired(true)
      .addChoices(
        { name: 'Wii U/Miiverse', value: 'wiiu' },
        { name: 'Switch', value: 'switch' },
        { name: 'Miitomo', value: 'miitomo' }
      ))
  .addStringOption(option => 
    option.setName('expression') 
      .setDescription('Select the expression that you want to use. The default one is the Normal expression.')
      .setRequired(true)
      .addChoices(
        { name: 'Normal', value: 'normal' },
        { name: 'Smile', value: 'smile' },
        { name: 'Anger', value: 'anger' },
        { name: 'Sorrow', value: 'sorrow' },
        { name: 'Surprise', value: 'surprise' },
        { name: 'Blink', value: 'blink' },
        { name: 'Normal (open mouth)', value: 'normal_open_mouth' },
        { name: 'Smile (open mouth)', value: 'smile_open_mouth' },
        { name: 'Anger (open mouth)', value: 'anger_open_mouth' },
        { name: 'Surprise (open mouth)', value: 'surprise_open_mouth' },
        { name: 'Sorrow (open mouth)', value: 'sorrow_open_mouth' },
        { name: 'Blink (open mouth)', value: 'blink_open_mouth' },
        { name: 'Wink (left eye open)', value: 'wink_left' },
        { name: 'Wink (right eye open)', value: 'wink_right' },
        { name: 'Wink (left eye and mouth open)', value: 'wink_left_open_mouth' },
        { name: 'Wink (right eye and mouth open)', value: 'wink_right_open_mouth' },
        { name: 'Wink (left eye open and smiling)', value: 'like_wink_left' },
        { name: 'Wink (right eye open and smiling)', value: 'like_wink_right' },
        { name: 'Frustrated', value: 'frustrated' },
        { name: '🥺', value: '🥺' }        
      ))
  .addStringOption(option => 
    option.setName('type')
      .setDescription('Select how your Mii will be positioned. The default is Portrait.')
      .setRequired(true)
      .addChoices(
        { name: 'Portrait', value: 'face' },
        { name: 'Head Only', value: 'face_only' },
        { name: 'Head Only Alt', value: 'fflmakeicon' },
        { name: 'Whole Body', value: 'all_body' },
        { name: 'Switch Portrait', value: 'variableiconbody' }
      ))
  .addStringOption(option => 
    option.setName('pnid')
      .setDescription('The PNID of the Mii to fetch. Leave blank if using NNID.')
      .setRequired(false))
  .addStringOption(option =>
    option.setName('nnid')
      .setDescription('The NNID of the Mii to fetch. Will only show Miis as they were in 4/8/24. Leave blank if using PNID.')
      .setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
    const miinnid = interaction.options.getString('nnid');
    const miipnid = interaction.options.getString('pnid');
    const miiRender = interaction.options.getString('render')!;
    const miiExpression = interaction.options.getString('expression')!;
    const miiType = interaction.options.getString('type')!;
    
    let nid: string | null = null;
    let api_id: number;
    let shaderType: number;

    switch (miiRender) {
        case 'wiiu': shaderType = 3; break;
        case 'miitomo': shaderType = 2; break;
        case 'switch': shaderType = 1; break;
        default: return;
    }

    if (miipnid && !miinnid) {
        api_id = 1; // PNID
        nid = miipnid;
    } else if (miinnid && !miipnid) {
        api_id = 0; // NNID
        nid = miinnid;
    } else {
        return await interaction.reply({ content: "Pleeeeeeeeeease enter either a PNID or NNID, but not both, or i'm going to cry.", ephemeral: true });
    }

    // Endpoints
    const miiImageURL = `https://mii-unsecure.ariankordi.net/miis/image.png?nnid=${nid}&api_id=${api_id}&type=${miiType}&width=1080&expression=${miiExpression}&shaderType=${shaderType}`;
    const miiDataURL = `https://mii-unsecure.ariankordi.net/mii_data/${nid}?api_id=${api_id}`;

    try {
        const [imageResponse, dataResponse] = await Promise.all([
            fetch(miiImageURL),
            fetch(miiDataURL)
        ]);

        if (!imageResponse.ok) {
            return interaction.reply({ content: 'Mii not found. Are you sure it exists outside of your imagination world?', ephemeral: true });
        }

        const imageStream = await imageResponse.body;
        const attachment = new AttachmentBuilder(imageStream, { name: 'mii.png' });
        const miiData = await dataResponse.json();
        const { data, pid, images, studio_url_data, ...filteredData } = miiData;
        
        const networkInfo = api_id === 1
            ? { idType: 'PNID', color: '#1b1f3b', text: 'Environment: Pretendo Network', favicon: 'https://pretendo.network/assets/images/icons/favicon-32x32.png' }
            : { idType: 'NNID', color: '#FF7D00', text: 'Environment: Nintendo Network', favicon: 'https://media.discordapp.net/attachments/1290013025633304696/1295241468625158144/favicon.png?ex=670def1e&is=670c9d9e&hm=df87ca7c20587e08f6c20c0dad9a09045836c8754f18d0e0c99165a3a90b2f93&=&format=webp&quality=lossless' };

        const prettyNames: { [key: string]: string } = {
            name: "Name",
            user_id: networkInfo.idType,
        };

        const embed = new EmbedBuilder()
            .setColor(networkInfo.color)
            .setTitle(`${miiData.name}'s Mii`)
            .setDescription('Here are the details for your really silly and cute Mii:')
            .setThumbnail('attachment://mii.png')
            .setFooter({ text: networkInfo.text, iconURL: networkInfo.favicon });

         for (const [key, value] of Object.entries(filteredData)) {
            const prettyKey = prettyNames[key] || key; 
            embed.addFields({ name: prettyKey, value: String(value), inline: true });
        }

        await interaction.reply({ embeds: [embed], files: [attachment] });

    } catch (error) {
        console.error('Error fetching Mii:', error);
        await interaction.reply({ content: "I couldn't fetch your Mii for some goddamm reason. Please try again or something idk you do you", ephemeral: true });
    }
}
