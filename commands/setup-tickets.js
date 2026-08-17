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
  .setDescription("Plaats het ticket-paneel in dit kanaal (alleen voor admins)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🎫 Support Tickets")
    .setDescription(
      "Heb je een vraag of probleem? Klik op de knop hieronder om een privé ticket te openen. Ons team helpt je zo snel mogelijk."
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("create_ticket")
      .setLabel("Open Ticket")
      .setEmoji("🎫")
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({ content: "Ticket-paneel geplaatst ✅", ephemeral: true });
}
