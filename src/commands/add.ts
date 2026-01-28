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
    .setName('add')
    .setDescription('Add a user to the ticket')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to add to the ticket')
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

    const targetUser = interaction.options.getUser('user', true);
    const result = await ticketManager.addUserToTicket(channel, targetUser);

    if (result.success) {
      await interaction.reply({
        embeds: [embedBuilder.createSuccessEmbed(result.message || 'User added')]
      });
    } else {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(result.error || 'Unknown error')],
        ephemeral: true
      });
    }
  }
};

module.exports = command;
export default command;
