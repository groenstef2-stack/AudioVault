import {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { saveTicketOpened, saveTicketClosed } from "./db.js";

const TICKET_TYPES = {
  support: {
    prefix: "ticket",
    label: "Support Ticket",
    color: 0x5865f2,
    welcomeText: (user) =>
      `Hi ${user}, welcome to your support ticket! Please describe your question or issue below and our team will help you as soon as possible.`,
  },
  work: {
    prefix: "application",
    label: "Work For Us Application",
    color: 0x57f287,
    welcomeText: (user) =>
      `Hi ${user}, thanks for your interest in joining the team! 💼\n\nPlease tell us:\n• Which position are you applying for?\n• Relevant experience or skills\n• Your availability\n\nOur team will review your application and get back to you soon.`,
  },
};

// Creates a new private ticket channel for the user who clicked the button.
// type is either "support" or "work".
export async function createTicket(interaction, type = "support") {
  const guild = interaction.guild;
  const user = interaction.user;
  const config = TICKET_TYPES[type] ?? TICKET_TYPES.support;

  const categoryId =
    type === "work"
      ? process.env.WORK_CATEGORY_ID || process.env.TICKET_CATEGORY_ID
      : process.env.TICKET_CATEGORY_ID;
  const supportRoleId = process.env.SUPPORT_ROLE_ID;

  // Prevent duplicate open tickets of the same type for this user
  const channelName = `${config.prefix}-${user.username}`.toLowerCase().slice(0, 90);
  const existing = guild.channels.cache.find((c) => c.name === channelName);
  if (existing) {
    await interaction.reply({
      content: `You already have an open ticket: ${existing}`,
      ephemeral: true,
    });
    return;
  }

  const overwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      id: interaction.client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
      ],
    },
  ];

  if (supportRoleId) {
    overwrites.push({
      id: supportRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    });
  }

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: categoryId || undefined,
    permissionOverwrites: overwrites,
    topic: `${config.label} from ${user.id}`,
  });

  const embed = new EmbedBuilder()
    .setColor(config.color)
    .setTitle(config.label)
    .setDescription(config.welcomeText(user));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Close Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    content: supportRoleId ? `<@&${supportRoleId}>` : undefined,
    embeds: [embed],
    components: [row],
  });

  try {
    await saveTicketOpened({
      channelId: channel.id,
      channelName: channel.name,
      userId: user.id,
      username: user.tag,
      type,
    });
  } catch (err) {
    console.error("Could not save ticket to database:", err);
  }

  await interaction.reply({
    content: `Your ticket has been created: ${channel}`,
    ephemeral: true,
  });
}

// Closes (deletes) the ticket channel, with a short countdown and optional log entry.
export async function closeTicket(interaction) {
  const channel = interaction.channel;

  const isTicketChannel =
    channel.name.startsWith("ticket-") || channel.name.startsWith("application-");

  if (!isTicketChannel) {
    await interaction.reply({
      content: "This command can only be used inside a ticket channel.",
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: "This ticket will be closed in 5 seconds...",
  });

  try {
    await saveTicketClosed({ channelId: channel.id, closedBy: interaction.user.tag });
  } catch (err) {
    console.error("Could not save ticket closure to database:", err);
  }

  const logChannelId = process.env.TICKET_LOG_CHANNEL_ID;
  if (logChannelId) {
    const logChannel = await interaction.client.channels
      .fetch(logChannelId)
      .catch(() => null);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle("Ticket Closed")
        .setDescription(`Channel: ${channel.name}\nClosed by: ${interaction.user.tag}`)
        .setTimestamp();
      await logChannel.send({ embeds: [embed] });
    }
  }

  setTimeout(async () => {
    await channel.delete().catch(() => null);
  }, 5000);
}
