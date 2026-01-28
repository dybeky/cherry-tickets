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
    .setName('rename')
    .setDescription('Rename the ticket channel')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('New name for the ticket channel')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const member = interaction.member as GuildMember;
    const ticket = ticketManager.getTicketData(channel);
    const locale = getLocale(ticket?.language === 'en' ? 'en' : 'ru');

    if (!ticketManager.isTicketChannel(channel)) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.ticket.notInTicket)],
        ephemeral: true
      });
      return;
    }

    if (!permissions.hasModPermission(member)) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.noPermission)],
        ephemeral: true
      });
      return;
    }

    const newName = interaction.options.getString('name', true);

    await interaction.deferReply({ ephemeral: true });

    const result = await ticketManager.renameTicket(channel, newName);

    if (result.success) {
      await interaction.editReply({
        embeds: [embedBuilder.createSuccessEmbed(result.message || 'Ticket renamed')]
      });
    } else {
      await interaction.editReply({
        embeds: [embedBuilder.createErrorEmbed(result.error || 'Unknown error')]
      });
    }
  }
};

module.exports = command;
export default command;
