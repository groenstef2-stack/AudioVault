import { EmbedBuilder } from "discord.js";

// Sends a welcome message when a new member joins the server.
export async function sendWelcomeMessage(member) {
  const channelId = process.env.WELCOME_CHANNEL_ID;
  if (!channelId) return;

  const channel = await member.client.channels.fetch(channelId).catch(() => null);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("👋 Welcome to the server!")
    .setDescription(
      `Welcome, ${member}! We're glad to have you here.\n\nFeel free to look around, and if you ever need help or want to apply to join the team, just open a ticket.`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: `Member #${member.guild.memberCount}` })
    .setTimestamp();

  await channel.send({ content: `${member}`, embeds: [embed] }).catch((err) => {
    console.error("Could not send welcome message:", err);
  });
}
