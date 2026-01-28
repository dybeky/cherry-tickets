import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  TextChannel,
  GuildMember
} from 'discord.js';
import ticketManager from '../handlers/ticketManager';
import embedBuilder from '../utils/embedBuilder';
import permissions from '../utils/permissions';
import { getLocale } from '../locales';
import { Command } from '../types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close the ticket'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const member = interaction.member as GuildMember;
    const ticket = ticketManager.getTicketData(channel);
    const locale = getLocale(ticket?.language === 'en' ? 'en' : 'ru');

    if (!ticketManager.isTicketChannel(channel) || !ticket) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.ticket.notInTicket)],
        ephemeral: true
      });
      return;
    }

    const isOwner = ticket.userId === interaction.user.id;
    const isMod = permissions.hasModPermission(member);

    if (!isOwner && !isMod) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.noPermission)],
        ephemeral: true
      });
      return;
    }

    await ticketManager.markTicketClosed(channel, interaction.user);

    const closedEmbed = embedBuilder.createClosedTicketEmbed(locale, ticket.id);
    const closedButtons = embedBuilder.createClosedTicketButtons(ticket.id, ticket.language || 'ru');

    await interaction.reply({
      embeds: [closedEmbed],
      components: [closedButtons]
    });
  }
};

module.exports = command;
export default command;
