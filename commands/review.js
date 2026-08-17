import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

const STARS = { 1: "⭐", 2: "⭐⭐", 3: "⭐⭐⭐", 4: "⭐⭐⭐⭐", 5: "⭐⭐⭐⭐⭐" };

export const data = new SlashCommandBuilder()
  .setName("review")
  .setDescription("Laat een review achter")
  .addIntegerOption((option) =>
    option
      .setName("rating")
      .setDescription("Hoeveel sterren geef je?")
      .setRequired(true)
      .addChoices(
        { name: "⭐ (1)", value: 1 },
        { name: "⭐⭐ (2)", value: 2 },
        { name: "⭐⭐⭐ (3)", value: 3 },
        { name: "⭐⭐⭐⭐ (4)", value: 4 },
        { name: "⭐⭐⭐⭐⭐ (5)", value: 5 }
      )
  )
  .addStringOption((option) =>
    option
      .setName("bericht")
      .setDescription("Je review in tekst")
      .setRequired(true)
      .setMaxLength(1000)
  );

export async function execute(interaction) {
  const rating = interaction.options.getInteger("rating");
  const message = interaction.options.getString("bericht");
  const reviewChannelId = process.env.REVIEW_CHANNEL_ID;

  const embed = new EmbedBuilder()
    .setColor(0xf5c518)
    .setAuthor({
      name: interaction.user.tag,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTitle(STARS[rating])
    .setDescription(message)
    .setFooter({ text: `Review van ${interaction.user.id}` })
    .setTimestamp();

  // Post de review in het aangewezen reviews-kanaal
  if (reviewChannelId) {
    const channel = await interaction.client.channels
      .fetch(reviewChannelId)
      .catch(() => null);
    if (channel) {
      await channel.send({ embeds: [embed] });
    }
  }

  // Plek om later Base44 te koppelen: stuur de review ook naar je website via een webhook.
  // Zie het stuk "BASE44_WEBHOOK_URL" in de .env voor waar dit later ingevuld wordt.
  if (process.env.BASE44_WEBHOOK_URL) {
    try {
      await fetch(process.env.BASE44_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: interaction.user.tag,
          userId: interaction.user.id,
          rating,
          message,
          createdAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Kon review niet naar Base44 sturen:", err);
    }
  }

  await interaction.reply({
    content: "Bedankt voor je review! ✅",
    ephemeral: true,
  });
}
