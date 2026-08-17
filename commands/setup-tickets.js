import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("setup-tickets")
  .setDescription("Place the ticket panel in this channel (admins only)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🎫 Support Tickets")
    .setDescription(
      "Do you have a question, a problem, or would you like to place an order with Robux? Click the button below to open a private ticket. Our team will help you as soon as possible."
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("Open Ticket")
      .setEmoji("🎫")
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({ content: "Ticket panel installed ✅", ephemeral: true });
}
