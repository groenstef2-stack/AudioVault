import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("embed")
  .setDescription("Send a custom embed message to a channel (admin only)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("Channel to send the embed to")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  );

export async function execute(interaction) {
  const channel = interaction.options.getChannel("channel");

  const modal = new ModalBuilder()
    .setCustomId(`embed_modal_${channel.id}`)
    .setTitle("Create Embed Message");

  const titleInput = new TextInputBuilder()
    .setCustomId("embed_title")
    .setLabel("Title")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(256);

  const descriptionInput = new TextInputBuilder()
    .setCustomId("embed_description")
    .setLabel("Description")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(4000);

  const colorInput = new TextInputBuilder()
    .setCustomId("embed_color")
    .setLabel("Color (hex code, e.g. #5865F2)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(7);

  const imageInput = new TextInputBuilder()
    .setCustomId("embed_image")
    .setLabel("Image URL (optional)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const footerInput = new TextInputBuilder()
    .setCustomId("embed_footer")
    .setLabel("Footer text (optional)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(2048);

  modal.addComponents(
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(descriptionInput),
    new ActionRowBuilder().addComponents(colorInput),
    new ActionRowBuilder().addComponents(imageInput),
    new ActionRowBuilder().addComponents(footerInput)
  );

  await interaction.showModal(modal);
}

// Called from index.js when the modal above is submitted.
export async function handleEmbedModalSubmit(interaction) {
  const channelId = interaction.customId.replace("embed_modal_", "");
  const channel = await interaction.client.channels.fetch(channelId).catch(() => null);

  if (!channel) {
    await interaction.reply({
      content: "Could not find that channel — it may have been deleted.",
      ephemeral: true,
    });
    return;
  }

  const title = interaction.fields.getTextInputValue("embed_title");
  const description = interaction.fields.getTextInputValue("embed_description");
  const colorInput = interaction.fields.getTextInputValue("embed_color");
  const image = interaction.fields.getTextInputValue("embed_image");
  const footer = interaction.fields.getTextInputValue("embed_footer");

  let color = 0x5865f2;
  if (colorInput) {
    const parsed = parseInt(colorInput.replace("#", ""), 16);
    if (!Number.isNaN(parsed)) color = parsed;
  }

  const embed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(description);
  if (image) embed.setImage(image);
  if (footer) embed.setFooter({ text: footer });

  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: `Embed sent to ${channel} ✅`, ephemeral: true });
}
