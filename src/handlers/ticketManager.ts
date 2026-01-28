import {
  TextChannel,
  User,
  Guild,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  AttachmentBuilder
} from 'discord.js';
import {
  getCategory,
  getChannel,
  getSetting,
  getUserTickets,
  createTicket as createNativeTicket,
  updateTicket as updateNativeTicket,
  closeTicket as closeNativeTicket,
  claimTicket as claimNativeTicket,
  setTicketRating,
  getTicketByChannelId,
  getTicketById
} from '../utils/dataManager';
import embedBuilder from '../utils/embedBuilder';
import permissions from '../utils/permissions';
import transcriptGenerator from '../utils/transcriptGenerator';
import { getTicketType } from '../config/ticketTypes';
import { getLocale } from '../locales';
import logger from '../utils/logger';
import {
  Ticket,
  Locale,
  LanguageCode,
  TicketCreateResult,
  TicketCloseResult,
  TicketClaimResult,
  TicketActionResult,
  TranscriptResult,
  FormData
} from '../types';

class TicketManager {
  private readonly categoryPrefixes: Record<string, string> = {
    'cheater_report': 'report',
    'staff_complaint': 'staff',
    'player_complaint': 'complaint',
    'unban_request': 'unban',
    'game_question': 'question',
    'tech_support': 'support',
    'moderator_application': 'application'
  };

  private getLocaleByCode(lang: string): Locale {
    return getLocale(lang as LanguageCode);
  }

  async createTicket(
    interaction: ChatInputCommandInteraction | ModalSubmitInteraction | StringSelectMenuInteraction | ButtonInteraction,
    ticketTypeId: string,
    lang: string,
    formData: FormData | null,
    server?: string
  ): Promise<TicketCreateResult> {
    const guild = interaction.guild;
    if (!guild) {
      return { success: false, error: 'Guild not found' };
    }

    const user = interaction.user;
    const locale = this.getLocaleByCode(lang);
    const ticketType = getTicketType(ticketTypeId);

    if (!ticketType) {
      return { success: false, error: locale.errors.generic };
    }

    const userTickets = getUserTickets(user.id);
    const maxTickets = getSetting('maxTicketsPerUser') ?? 2;

    if (userTickets.length >= maxTickets) {
      return {
        success: false,
        embed: embedBuilder.createLimitReachedEmbed(locale, userTickets.length, maxTickets)
      };
    }

    const categoryId = getCategory(ticketType.categoryKey);
    if (!categoryId) {
      return { success: false, error: locale.errors.categoryNotFound };
    }

    try {
      const ticketData = await createNativeTicket({
        type: ticketTypeId,
        userId: user.id,
        guildId: guild.id,
        channelId: null,
        language: lang,
        server,
        formData
      });

      const prefix = this.categoryPrefixes[ticketTypeId] || 'ticket';
      const channelName = `${prefix}-${ticketData.id}`;

      const channel = await permissions.createTicketChannel(
        guild,
        channelName,
        categoryId,
        user.id,
        ticketType
      );

      updateNativeTicket(ticketData.id, { channelId: channel.id });
      ticketData.channelId = channel.id;

      const ticketEmbed = embedBuilder.createTicketEmbed(ticketData as Ticket, locale, ticketType);

      await channel.send({
        content: `<@${user.id}>`,
        embeds: [ticketEmbed]
      });

      const roleMentions = permissions.getRoleMentions(ticketType);
      if (roleMentions) {
        const pingMsg = await channel.send({ content: roleMentions });
        const pingDeleteDelay = getSetting('pingDeleteDelay') ?? 5000;
        setTimeout(() => {
          pingMsg.delete().catch(() => {});
        }, pingDeleteDelay);
      }

      return {
        success: true,
        channel,
        ticket: ticketData as Ticket
      };
    } catch (error) {
      logger.error('Error creating ticket', error as Error);
      return { success: false, error: locale.errors.generic };
    }
  }

  async markTicketClosed(channel: TextChannel, closedBy: User): Promise<TicketCloseResult> {
    const ticket = getTicketByChannelId(channel.id);
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    try {
      closeNativeTicket(ticket.id, closedBy.id, '');
      const updatedTicket = getTicketById(ticket.id);

      const newName = `closed-${channel.name}`.substring(0, 100);
      await channel.setName(newName).catch(() => {});

      logger.ticket('closed', ticket.id, closedBy.id);

      return { success: true, ticket: updatedTicket as Ticket };
    } catch (error) {
      logger.error('Error marking ticket closed', error as Error);
      return { success: false, error: 'Error closing ticket' };
    }
  }

  async reopenTicket(channel: TextChannel): Promise<TicketActionResult> {
    const ticket = getTicketByChannelId(channel.id);
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    try {
      updateNativeTicket(ticket.id, { status: 'open', closedBy: undefined, closeReason: undefined, closedAt: undefined });

      const newName = channel.name.replace(/^closed-/, '');
      await channel.setName(newName).catch(() => {});

      logger.ticket('reopened', ticket.id, '');

      return { success: true, message: 'Ticket reopened' };
    } catch (error) {
      logger.error('Error reopening ticket', error as Error);
      return { success: false, error: 'Error reopening ticket' };
    }
  }

  async deleteTicket(channel: TextChannel, deletedBy: User): Promise<TicketCloseResult> {
    const ticket = getTicketByChannelId(channel.id);
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    const locale = this.getLocaleByCode(ticket.language || 'ru');

    try {
      await channel.delete();

      logger.ticket('deleted', ticket.id, deletedBy.id);

      return { success: true, ticket: ticket as Ticket };
    } catch (error) {
      logger.error('Error deleting ticket', error as Error);
      return { success: false, error: locale.errors.generic };
    }
  }

  async saveTranscriptToLogs(channel: TextChannel): Promise<{ success: boolean }> {
    const ticket = getTicketByChannelId(channel.id);
    if (!ticket) {
      return { success: false };
    }

    const guild = channel.guild;

    try {
      const transcript = await transcriptGenerator.generateTranscript(channel);

      if (!transcript) {
        return { success: false };
      }

      const logChannelId = getChannel('ticketLogs');
      if (logChannelId) {
        try {
          const logChannel = await guild.channels.fetch(logChannelId) as TextChannel | null;
          if (logChannel) {
            const logEmbed = embedBuilder.createTranscriptLogEmbed(ticket.id, ticket.closedBy || '');
            await logChannel.send({
              embeds: [logEmbed],
              files: [transcript]
            });
          }
        } catch (err) {
          logger.error('Error sending transcript to logs', err as Error);
        }
      }

      return { success: true };
    } catch (error) {
      logger.error('Error saving transcript', error as Error);
      return { success: false };
    }
  }

  async closeTicket(
    channel: TextChannel,
    closedBy: User,
    reason: string,
    skipTranscript = false
  ): Promise<TicketCloseResult> {
    return this.markTicketClosed(channel, closedBy);
  }

  async claimTicket(channel: TextChannel, user: User): Promise<TicketClaimResult> {
    const ticket = getTicketByChannelId(channel.id);
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    const locale = this.getLocaleByCode(ticket.language || 'ru');

    if (ticket.claimedBy) {
      return { success: false, error: 'Ticket already claimed' };
    }

    try {
      claimNativeTicket(ticket.id, user.id);

      const newName = `claimed-${channel.name}`.substring(0, 100);
      await channel.setName(newName);

      const claimedEmbed = embedBuilder.createClaimedEmbed(locale, user);
      await channel.send({ embeds: [claimedEmbed] });

      return { success: true };
    } catch (error) {
      logger.error('Error claiming ticket', error as Error);
      return { success: false, error: locale.errors.generic };
    }
  }

  async callSenior(channel: TextChannel): Promise<TicketActionResult> {
    const ticket = getTicketByChannelId(channel.id);
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    const locale = this.getLocaleByCode(ticket.language || 'ru');

    try {
      const mentions = permissions.getSeniorMentions();
      await channel.send({
        content: `${mentions}\n${locale.ticket.pingStaff}`
      });

      return { success: true, message: locale.ticket.seniorCalled };
    } catch (error) {
      logger.error('Error calling senior', error as Error);
      return { success: false, error: locale.errors.generic };
    }
  }

  async rateTicket(ticketId: number, rating: number): Promise<{ success: boolean }> {
    try {
      setTicketRating(ticketId, rating);
      return { success: true };
    } catch (error) {
      logger.error('Error rating ticket', error as Error);
      return { success: false };
    }
  }

  async addUserToTicket(channel: TextChannel, targetUser: User): Promise<TicketActionResult> {
    const ticket = getTicketByChannelId(channel.id);
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    const locale = this.getLocaleByCode(ticket.language || 'ru');

    try {
      await permissions.addUserToTicket(channel, targetUser.id);
      return {
        success: true,
        message: locale.ticket.userAdded.replace('{user}', `<@${targetUser.id}>`)
      };
    } catch (error) {
      logger.error('Error adding user to ticket', error as Error);
      return { success: false, error: locale.errors.generic };
    }
  }

  async removeUserFromTicket(channel: TextChannel, targetUser: User): Promise<TicketActionResult> {
    const ticket = getTicketByChannelId(channel.id);
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    const locale = this.getLocaleByCode(ticket.language || 'ru');

    try {
      await permissions.removeUserFromTicket(channel, targetUser.id);
      return {
        success: true,
        message: locale.ticket.userRemoved.replace('{user}', `<@${targetUser.id}>`)
      };
    } catch (error) {
      logger.error('Error removing user from ticket', error as Error);
      return { success: false, error: locale.errors.generic };
    }
  }

  async renameTicket(channel: TextChannel, newName: string): Promise<TicketActionResult> {
    const ticket = getTicketByChannelId(channel.id);
    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    const locale = this.getLocaleByCode(ticket.language || 'ru');

    try {
      const safeName = newName.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 100);
      await channel.setName(safeName);
      return {
        success: true,
        message: locale.ticket.renamed.replace('{name}', safeName)
      };
    } catch (error) {
      logger.error('Error renaming ticket', error as Error);
      return { success: false, error: locale.errors.generic };
    }
  }

  async generateTranscriptOnly(channel: TextChannel): Promise<TranscriptResult> {
    try {
      const transcript = await transcriptGenerator.generateTranscript(channel);
      return { success: true, transcript: transcript || undefined };
    } catch (error) {
      logger.error('Error generating transcript', error as Error);
      return { success: false };
    }
  }

  isTicketChannel(channel: TextChannel): boolean {
    return !!getTicketByChannelId(channel.id);
  }

  getTicketData(channel: TextChannel): Ticket | null {
    return getTicketByChannelId(channel.id) as Ticket | null;
  }
}

export default new TicketManager();
