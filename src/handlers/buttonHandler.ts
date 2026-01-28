import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonInteraction,
  TextChannel,
  GuildMember
} from 'discord.js';
import ticketManager from './ticketManager';
import embedBuilder from '../utils/embedBuilder';
import permissions from '../utils/permissions';
import { getLocale } from '../locales';
import logger from '../utils/logger';
import { LanguageCode } from '../types';

class ButtonHandler {
  private getLocaleByCode(lang: string) {
    return getLocale(lang as LanguageCode);
  }

  async handleClose(interaction: ButtonInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const ticket = ticketManager.getTicketData(channel);
    const locale = this.getLocaleByCode(ticket?.language || 'ru');

    const modal = new ModalBuilder()
      .setCustomId('ticket_close_modal')
      .setTitle(locale.modals.close.title);

    const reasonInput = new TextInputBuilder()
      .setCustomId('close_reason')
      .setLabel(locale.modals.close.reason.label)
      .setPlaceholder(locale.modals.close.reason.placeholder)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setMaxLength(500);

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput));

    await interaction.showModal(modal);
  }

  async handleClaim(interaction: ButtonInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const ticket = ticketManager.getTicketData(channel);
    const locale = this.getLocaleByCode(ticket?.language || 'ru');
    const member = interaction.member as GuildMember;

    if (!permissions.hasModPermission(member)) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.noPermission)],
        ephemeral: true
      });
      return;
    }

    const result = await ticketManager.claimTicket(channel, interaction.user);

    if (result.success) {
      await interaction.update({
        components: embedBuilder.createTicketButtons(locale, true)
      });
    } else {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(result.error || 'Unknown error')],
        ephemeral: true
      });
    }
  }

  async handleTranscript(interaction: ButtonInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const ticket = ticketManager.getTicketData(channel);
    const locale = this.getLocaleByCode(ticket?.language || 'ru');
    const member = interaction.member as GuildMember;

    if (!permissions.hasModPermission(member)) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.noPermission)],
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const result = await ticketManager.generateTranscriptOnly(channel);

    if (result.success && result.transcript) {
      await interaction.editReply({
        content: 'Transcript generated:',
        files: [result.transcript]
      });
    } else {
      await interaction.editReply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.generic)]
      });
    }
  }

  async handleCallSenior(interaction: ButtonInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const ticket = ticketManager.getTicketData(channel);
    const locale = this.getLocaleByCode(ticket?.language || 'ru');

    const result = await ticketManager.callSenior(channel);

    if (result.success) {
      await interaction.reply({
        embeds: [embedBuilder.createSuccessEmbed(result.message || 'Senior called')],
        ephemeral: true
      });
    } else {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(result.error || 'Unknown error')],
        ephemeral: true
      });
    }
  }

  async handleFeedback(interaction: ButtonInteraction, isPositive: boolean, moderatorId: string, ticketId: number): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const ticket = ticketManager.getTicketData(channel);
    const locale = this.getLocaleByCode(ticket?.language || 'ru');
    const isRu = locale.languageCode === 'ru';

    // Verify the user is the ticket creator
    if (!ticket || interaction.user.id !== ticket.userId) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.noPermission)],
        ephemeral: true
      });
      return;
    }

    // Show modal for feedback comment
    const modal = new ModalBuilder()
      .setCustomId(`feedback_modal_${isPositive ? 'positive' : 'negative'}_${moderatorId}_${ticketId}`)
      .setTitle(isRu ? 'Оставьте отзыв' : 'Leave Feedback');

    const commentInput = new TextInputBuilder()
      .setCustomId('feedback_comment')
      .setLabel(isRu ? 'Почему вы поставили такую оценку?' : 'Why did you give this rating?')
      .setPlaceholder(isRu ? 'Опишите вашу причину (необязательно)' : 'Describe your reason (optional)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setMaxLength(500);

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(commentInput));

    await interaction.showModal(modal);
  }

  async handleCreateTicket(interaction: ButtonInteraction): Promise<void> {
    logger.debug(`Create ticket button clicked by ${interaction.user.id}`);

    // Show language selection embed
    const embed = embedBuilder.createLanguageSelectionEmbed();
    const buttons = embedBuilder.createLanguageButtons();

    await interaction.reply({
      embeds: [embed],
      components: [buttons],
      ephemeral: true
    });
  }

  async handleLanguageSelect(interaction: ButtonInteraction, lang: string): Promise<void> {
    const locale = this.getLocaleByCode(lang);
    const isRu = lang === 'ru';

    // Show category selection embed with language confirmed
    const embed = embedBuilder.createCategorySelectionEmbed(lang)
      .setDescription(isRu
        ? `Язык: ${lang === 'ru' ? 'Русский' : 'English'}\n\nВыберите категорию:`
        : `Language: ${lang === 'ru' ? 'Russian' : 'English'}\n\nSelect category:`
      );
    const buttons = embedBuilder.createCategoryButtons(lang, locale);

    await interaction.update({
      embeds: [embed],
      components: buttons
    });
  }

  async handleCategorySelect(interaction: ButtonInteraction, categoryId: string, lang: string): Promise<void> {
    const locale = this.getLocaleByCode(lang);
    const isRu = lang === 'ru';
    const categoryName = locale.categories[categoryId]?.name || categoryId;

    // Show server selection with category confirmed
    const serverEmbed = embedBuilder.createServerSelectionEmbed(lang)
      .setDescription(isRu
        ? `Категория: ${categoryName}\n\nВыберите сервер:`
        : `Category: ${categoryName}\n\nSelect server:`
      );
    const serverButtons = embedBuilder.createServerButtons(categoryId, lang);

    await interaction.update({
      embeds: [serverEmbed],
      components: serverButtons
    });
  }

  async handleServerSelect(interaction: ButtonInteraction, categoryId: string, serverId: string, lang: string): Promise<void> {
    const locale = this.getLocaleByCode(lang);
    const isRu = lang === 'ru';

    // Disable buttons and show "Creating ticket..."
    await interaction.update({
      embeds: [embedBuilder.createSuccessEmbed(isRu ? 'Создание тикета...' : 'Creating ticket...')],
      components: []
    });

    // Create ticket directly without description modal
    try {
      const result = await ticketManager.createTicket(
        interaction,
        categoryId,
        lang,
        null, // No form data
        serverId
      );

      if (result.success && result.channel) {
        logger.ticket('created', result.ticket?.id || 0, interaction.user.id);

        await interaction.editReply({
          embeds: [embedBuilder.createSuccessEmbed(
            isRu
              ? `Тикет создан: <#${result.channel.id}>`
              : `Ticket created: <#${result.channel.id}>`
          )],
          components: []
        });
      } else if (result.embed) {
        await interaction.editReply({
          embeds: [result.embed],
          components: []
        });
      } else {
        await interaction.editReply({
          embeds: [embedBuilder.createErrorEmbed(result.error || locale.errors.generic)],
          components: []
        });
      }
    } catch (error) {
      logger.error('Error creating ticket from button', error as Error);
      await interaction.editReply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.generic)],
        components: []
      });
    }
  }

  async handleTicketReopen(interaction: ButtonInteraction, ticketId: number): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const ticket = ticketManager.getTicketData(channel);
    const locale = this.getLocaleByCode(ticket?.language || 'ru');
    const member = interaction.member as GuildMember;

    if (!permissions.hasModPermission(member)) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.noPermission)],
        ephemeral: true
      });
      return;
    }

    const result = await ticketManager.reopenTicket(channel);

    if (result.success) {
      // Delete the close message
      await interaction.message.delete().catch(() => {});

      await interaction.reply({
        embeds: [embedBuilder.createSuccessEmbed(locale.languageCode === 'ru' ? 'Тикет открыт заново' : 'Ticket reopened')],
        ephemeral: true
      });
    } else {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(result.error || 'Error')],
        ephemeral: true
      });
    }
  }

  async handleTicketTranscriptSave(interaction: ButtonInteraction, ticketId: number): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const ticket = ticketManager.getTicketData(channel);
    const locale = this.getLocaleByCode(ticket?.language || 'ru');
    const member = interaction.member as GuildMember;

    if (!permissions.hasModPermission(member)) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.noPermission)],
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const result = await ticketManager.saveTranscriptToLogs(channel);

    if (result.success) {
      await interaction.editReply({
        embeds: [embedBuilder.createSuccessEmbed(locale.languageCode === 'ru' ? 'Транскрипт сохранен в логи' : 'Transcript saved to logs')]
      });
    } else {
      await interaction.editReply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.generic)]
      });
    }
  }

  async handleTicketDelete(interaction: ButtonInteraction, ticketId: number): Promise<void> {
    const channel = interaction.channel as TextChannel;
    const ticket = ticketManager.getTicketData(channel);
    const locale = this.getLocaleByCode(ticket?.language || 'ru');
    const member = interaction.member as GuildMember;

    if (!permissions.hasModPermission(member)) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.noPermission)],
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    await ticketManager.deleteTicket(channel, interaction.user);
  }

  async handle(interaction: ButtonInteraction): Promise<void> {
    const customId = interaction.customId;

    // Handle create_ticket button separately (not in a ticket channel)
    if (customId === 'create_ticket') {
      await this.handleCreateTicket(interaction);
      return;
    }

    // Handle language selection buttons
    if (customId === 'lang_en' || customId === 'lang_ru') {
      const lang = customId === 'lang_en' ? 'en' : 'ru';
      await this.handleLanguageSelect(interaction, lang);
      return;
    }

    // Handle category selection buttons (cat_<categoryId>_<lang>)
    if (customId.startsWith('cat_')) {
      const parts = customId.split('_');
      const lang = parts[parts.length - 1];
      const categoryId = parts.slice(1, -1).join('_');
      await this.handleCategorySelect(interaction, categoryId, lang);
      return;
    }

    // Handle server selection buttons (srv_<categoryId>_<serverId>_<lang>)
    if (customId.startsWith('srv_')) {
      const parts = customId.split('_');
      const lang = parts[parts.length - 1];
      const serverId = parts[parts.length - 2];
      const categoryId = parts.slice(1, -2).join('_');
      await this.handleServerSelect(interaction, categoryId, serverId, lang);
      return;
    }

    // Handle feedback buttons
    if (customId.startsWith('feedback_positive_') || customId.startsWith('feedback_negative_')) {
      const isPositive = customId.startsWith('feedback_positive_');
      const parts = customId.split('_');
      const moderatorId = parts[2];
      const ticketId = parseInt(parts[3]);

      await this.handleFeedback(interaction, isPositive, moderatorId, ticketId);
      return;
    }

    // Handle disabled feedback buttons (do nothing)
    if (customId.startsWith('feedback_disabled')) {
      await interaction.deferUpdate();
      return;
    }

    // Handle ticket reopen button (ticket_reopen_<ticketId>)
    if (customId.startsWith('ticket_reopen_')) {
      const ticketId = parseInt(customId.replace('ticket_reopen_', ''));
      await this.handleTicketReopen(interaction, ticketId);
      return;
    }

    // Handle ticket transcript save button (ticket_transcript_save_<ticketId>)
    if (customId.startsWith('ticket_transcript_save_')) {
      const ticketId = parseInt(customId.replace('ticket_transcript_save_', ''));
      await this.handleTicketTranscriptSave(interaction, ticketId);
      return;
    }

    // Handle ticket delete button (ticket_delete_<ticketId>)
    if (customId.startsWith('ticket_delete_')) {
      const ticketId = parseInt(customId.replace('ticket_delete_', ''));
      await this.handleTicketDelete(interaction, ticketId);
      return;
    }

    const channel = interaction.channel as TextChannel;

    if (!ticketManager.isTicketChannel(channel)) {
      const locale = this.getLocaleByCode('ru');
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.ticket.notInTicket)],
        ephemeral: true
      });
      return;
    }

    switch (customId) {
      case 'ticket_close':
        await this.handleClose(interaction);
        break;
      case 'ticket_claim':
        await this.handleClaim(interaction);
        break;
      case 'ticket_transcript':
        await this.handleTranscript(interaction);
        break;
      case 'ticket_call_senior':
        await this.handleCallSenior(interaction);
        break;
      default:
        break;
    }
  }
}

export default new ButtonHandler();
