import {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { saveTicketOpened, saveTicketClosed } from "./db.js";

// Maakt een nieuw privé ticketkanaal aan voor de gebruiker die op de knop klikte
export async function createTicket(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;
  const categoryId = process.env.TICKET_CATEGORY_ID;
  const supportRoleId = process.env.SUPPORT_ROLE_ID;

  // Voorkom dubbele tickets: check of er al een kanaal is met deze naam
  const channelName = `ticket-${user.username}`.toLowerCase().slice(0, 90);
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
    topic: `Ticket from ${user.id}`,
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Ticket geopend")
    .setDescription(
      `Hoi ${user}, Welcome to your ticket! Please describe your question or problem below, and our team will help you as soon as possible.`
    );

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
    });
  } catch (err) {
    console.error("Could not save ticket to database:", err);
  }

  await interaction.reply({
    content: `Your ticket has been created: ${channel}`,
    ephemeral: true,
  });
}

// Sluit (verwijdert) het ticketkanaal, met korte countdown en optionele log
export async function closeTicket(interaction) {
  const channel = interaction.channel;

  if (!channel.name.startsWith("ticket-")) {
    await interaction.reply({
      content: "This command can only be used in a ticket channel.",
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
        .setTitle("Ticket closed")
        .setDescription(`Channel: ${channel.name}\nClosed by: ${interaction.user.tag}`)
        .setTimestamp();
      await logChannel.send({ embeds: [embed] });
    }
  }

  setTimeout(async () => {
    await channel.delete().catch(() => null);
  }, 5000);
}
