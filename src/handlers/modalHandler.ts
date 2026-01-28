import { ModalSubmitInteraction, TextChannel } from 'discord.js';
import ticketManager from './ticketManager';
import embedBuilder from '../utils/embedBuilder';
import { getLocale } from '../locales';
import { createFeedback, getChannel } from '../utils/dataManager';
import logger from '../utils/logger';
import { LanguageCode } from '../types';

class ModalHandler {
  private getLocaleByCode(lang: string) {
    return getLocale(lang as LanguageCode);
  }

  async handleCloseModal(interaction: ModalSubmitInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const ticket = ticketManager.getTicketData(channel);
    const locale = this.getLocaleByCode(ticket?.language || 'ru');

    await interaction.deferReply({ ephemeral: true });

    try {
      await ticketManager.markTicketClosed(channel, interaction.user);

      const closedEmbed = embedBuilder.createClosedTicketEmbed(locale, ticket?.id || 0);
      const closedButtons = embedBuilder.createClosedTicketButtons(ticket?.id || 0, ticket?.language || 'ru');

      await interaction.editReply({
        embeds: [closedEmbed],
        components: [closedButtons]
      });
    } catch (error) {
      logger.error('Exception closing ticket', error as Error);
      await interaction.editReply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.generic)]
      });
    }
  }

  async handleFeedbackModal(
    interaction: ModalSubmitInteraction,
    isPositive: boolean,
    moderatorId: string,
    ticketId: number
  ): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const ticket = ticketManager.getTicketData(channel);
    const locale = this.getLocaleByCode(ticket?.language || 'ru');

    const comment = interaction.fields.getTextInputValue('feedback_comment') || '';

    const feedback = createFeedback({
      ticketId,
      moderatorId,
      moderatorName: '',
      userId: interaction.user.id,
      userName: interaction.user.username,
      rating: isPositive ? 'positive' : 'negative',
      comment
    });

    const thanksEmbed = embedBuilder.createFeedbackThanksEmbed(locale, isPositive);
    await interaction.reply({
      embeds: [thanksEmbed],
      ephemeral: true
    });

    try {
      const disabledButtons = embedBuilder.createFeedbackDisabledButtons();
      if (interaction.message) {
        await interaction.message.edit({
          components: [disabledButtons]
        });
      }
    } catch {
    }

    const feedbackLogsChannelId = getChannel('feedbackLogs');
    if (feedbackLogsChannelId && interaction.guild) {
      try {
        const feedbackChannel = await interaction.guild.channels.fetch(feedbackLogsChannelId) as TextChannel | null;
        if (feedbackChannel) {
          const logEmbed = embedBuilder.createFeedbackLogEmbed(feedback, locale);
          await feedbackChannel.send({ embeds: [logEmbed] });
        }
      } catch (err) {
        logger.error('Error sending feedback to logs', err as Error);
      }
    }
  }

  async handle(interaction: ModalSubmitInteraction): Promise<void> {
    const customId = interaction.customId;

    try {
      if (customId === 'ticket_close_modal') {
        await this.handleCloseModal(interaction);
      } else if (customId.startsWith('feedback_modal_')) {
        const parts = customId.replace('feedback_modal_', '').split('_');
        const isPositive = parts[0] === 'positive';
        const moderatorId = parts[1];
        const ticketId = parseInt(parts[2]);

        await this.handleFeedbackModal(interaction, isPositive, moderatorId, ticketId);
      }
    } catch (error) {
      logger.error('Error in ModalHandler', error as Error);
    }
  }
}

export default new ModalHandler();
