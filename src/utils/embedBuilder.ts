import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';
import { ticketTypes } from '../config/ticketTypes';
import { Locale, Ticket, TicketTypeConfig, EmbedColors, Feedback } from '../types';

export const SERVERS = [
  { id: 'russia', name: 'Russia' },
  { id: 'pei', name: 'PEI' },
  { id: 'washington', name: 'Washington' }
];

class EmbedBuilderUtil {
  private colors: EmbedColors = {
    primary: 0x5865F2,
    success: 0x57F287,
    warning: 0xFEE75C,
    danger: 0xED4245,
    info: 0x5865F2
  };

  createPanelEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('Support System')
      .setDescription(
        '**EN:** Click the button below to create a support ticket.\n' +
        '**RU:** Нажмите кнопку ниже, чтобы создать тикет.\n\n' +
        'A form will open to fill in your request details.'
      )
      .setColor(this.colors.primary)
      .setFooter({ text: 'Unturned Server' })
      .setTimestamp();
  }

  createTicketButton(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Create Ticket')
          .setStyle(ButtonStyle.Primary)
      );
  }

  createLanguageSelectMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
    return new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket_language_select')
          .setPlaceholder('Select language')
          .addOptions([
            new StringSelectMenuOptionBuilder()
              .setLabel('Русский')
              .setDescription('Создать тикет на русском языке')
              .setValue('ru'),
            new StringSelectMenuOptionBuilder()
              .setLabel('English')
              .setDescription('Create a ticket in English')
              .setValue('en')
          ])
      );
  }

  createTicketFormEmbed(locale: Locale, lang: string): EmbedBuilder {
    const isRu = lang === 'ru';

    return new EmbedBuilder()
      .setTitle(isRu ? 'Создание тикета' : 'Create Ticket')
      .setDescription(isRu
        ? '**Выберите сервер и категорию обращения:**\n\n' +
          '1. Сначала выберите сервер\n' +
          '2. Затем выберите категорию вашего обращения\n\n' +
          'После выбора откроется форма для заполнения деталей'
        : '**Select server and ticket category:**\n\n' +
          '1. First, select the server\n' +
          '2. Then select your ticket category\n\n' +
          'A form will open after selection to fill in details'
      )
      .setColor(this.colors.primary)
      .setFooter({ text: 'Unturned Server' })
      .setTimestamp();
  }

  createLanguageSelectionEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('Create Ticket / Создать тикет')
      .setDescription(
        '**EN:** Select your language below\n' +
        '**RU:** Выберите язык ниже'
      )
      .setColor(this.colors.primary)
      .setFooter({ text: 'Unturned Server' })
      .setTimestamp();
  }

  createLanguageButtons(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('lang_en')
          .setLabel('English')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('lang_ru')
          .setLabel('Русский')
          .setStyle(ButtonStyle.Secondary)
      );
  }

  createCategorySelectionEmbed(lang: string): EmbedBuilder {
    const isRu = lang === 'ru';

    return new EmbedBuilder()
      .setTitle(isRu ? 'Выберите категорию' : 'Select Category')
      .setDescription(isRu
        ? 'Выберите категорию вашего обращения:'
        : 'Select the category of your request:'
      )
      .setColor(this.colors.primary)
      .setFooter({ text: 'Unturned Server' })
      .setTimestamp();
  }

  createCategoryButtons(lang: string, locale: Locale): ActionRowBuilder<ButtonBuilder>[] {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];

    rows.push(new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`cat_cheater_report_${lang}`)
          .setLabel(locale.categories.cheater_report.name)
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`cat_staff_complaint_${lang}`)
          .setLabel(locale.categories.staff_complaint.name)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`cat_player_complaint_${lang}`)
          .setLabel(locale.categories.player_complaint.name)
          .setStyle(ButtonStyle.Secondary)
      )
    );

    rows.push(new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`cat_unban_request_${lang}`)
          .setLabel(locale.categories.unban_request.name)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`cat_game_question_${lang}`)
          .setLabel(locale.categories.game_question.name)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`cat_tech_support_${lang}`)
          .setLabel(locale.categories.tech_support.name)
          .setStyle(ButtonStyle.Secondary)
      )
    );

    rows.push(new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`cat_moderator_application_${lang}`)
          .setLabel(locale.categories.moderator_application.name)
          .setStyle(ButtonStyle.Secondary)
      )
    );

    return rows;
  }

  createServerSelectionEmbed(lang: string): EmbedBuilder {
    const isRu = lang === 'ru';

    return new EmbedBuilder()
      .setTitle(isRu ? 'Выберите сервер' : 'Select Server')
      .setColor(this.colors.primary)
      .setFooter({ text: 'Unturned Server' })
      .setTimestamp();
  }

  createServerButtons(categoryId: string, lang: string): ActionRowBuilder<ButtonBuilder>[] {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];

    rows.push(new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`srv_${categoryId}_russia_${lang}`)
          .setLabel('Russia')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`srv_${categoryId}_pei_${lang}`)
          .setLabel('PEI')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`srv_${categoryId}_washington_${lang}`)
          .setLabel('Washington')
          .setStyle(ButtonStyle.Secondary)
      )
    );

    return rows;
  }

  createServerSelectMenu(lang: string): ActionRowBuilder<StringSelectMenuBuilder> {
    const isRu = lang === 'ru';

    return new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`ticket_server_select_${lang}`)
          .setPlaceholder(isRu ? 'Выберите сервер' : 'Select server')
          .addOptions(
            SERVERS.map(server =>
              new StringSelectMenuOptionBuilder()
                .setLabel(server.name)
                .setValue(server.id)
            )
          )
      );
  }

  createCategorySelectMenu(locale: Locale, lang: string, serverId?: string): ActionRowBuilder<StringSelectMenuBuilder> {
    const options = ticketTypes.map(type =>
      new StringSelectMenuOptionBuilder()
        .setLabel(locale.categories[type.id].name)
        .setDescription(locale.categories[type.id].description)
        .setValue(serverId ? `${type.id}_${serverId}_${lang}` : `${type.id}_${lang}`)
    );

    return new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket_category_select')
          .setPlaceholder(locale.panel.selectCategory)
          .addOptions(options)
      );
  }

  createTicketEmbed(ticket: Ticket, locale: Locale, ticketType: TicketTypeConfig): EmbedBuilder {
    const isRu = locale.languageCode === 'ru';

    const embed = new EmbedBuilder()
      .setTitle(locale.ticket.created.title)
      .setColor(ticketType.color)
      .addFields(
        { name: locale.ticket.created.fields.author, value: `<@${ticket.userId}>`, inline: true }
      )
      .setFooter({ text: `Ticket #${ticket.id}` })
      .setTimestamp();

    if (ticket.server) {
      const serverInfo = SERVERS.find(s => s.id === ticket.server);
      const serverName = serverInfo?.name || ticket.server;
      embed.addFields({
        name: isRu ? 'Сервер' : 'Server',
        value: serverName,
        inline: true
      });
    }

    return embed;
  }

  createTicketButtons(locale: Locale, isClaimed = false): ActionRowBuilder<ButtonBuilder>[] {
    const row1 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel(locale.ticket.buttons.close)
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('ticket_claim')
          .setLabel(isClaimed ? locale.ticket.buttons.claimed : locale.ticket.buttons.claim)
          .setStyle(isClaimed ? ButtonStyle.Success : ButtonStyle.Primary)
          .setDisabled(isClaimed),
        new ButtonBuilder()
          .setCustomId('ticket_transcript')
          .setLabel(locale.ticket.buttons.transcript)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('ticket_call_senior')
          .setLabel(locale.ticket.buttons.callSenior)
          .setStyle(ButtonStyle.Secondary)
      );

    return [row1];
  }

  createClosedTicketEmbed(locale: Locale, ticketId: number): EmbedBuilder {
    const isRu = locale.languageCode === 'ru';

    return new EmbedBuilder()
      .setTitle(isRu ? 'Тикет закрыт' : 'Ticket Closed')
      .setDescription(isRu
        ? 'Тикет был закрыт. Выберите действие:'
        : 'Ticket has been closed. Choose an action:'
      )
      .setColor(this.colors.warning)
      .setFooter({ text: `Ticket #${ticketId}` })
      .setTimestamp();
  }

  createClosedTicketButtons(ticketId: number, lang: string): ActionRowBuilder<ButtonBuilder> {
    const isRu = lang === 'ru';

    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_reopen_${ticketId}`)
          .setLabel(isRu ? 'Открыть' : 'Reopen')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`ticket_transcript_save_${ticketId}`)
          .setLabel(isRu ? 'Транскрипт' : 'Transcript')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`ticket_delete_${ticketId}`)
          .setLabel(isRu ? 'Удалить' : 'Delete')
          .setStyle(ButtonStyle.Danger)
      );
  }

  createTranscriptLogEmbed(ticketId: number, closedById: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`Ticket #${ticketId}`)
      .setColor(this.colors.info)
      .addFields(
        { name: 'Closed by', value: closedById ? `<@${closedById}>` : 'Unknown', inline: true }
      )
      .setTimestamp();
  }

  createClaimedEmbed(locale: Locale, user: { id: string }): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(locale.ticket.claimed.title)
      .setDescription(locale.ticket.claimed.description.replace('{user}', `<@${user.id}>`))
      .setColor(this.colors.success)
      .setTimestamp();
  }

  createClosingEmbed(locale: Locale, reason: string | null, seconds: number): EmbedBuilder {
    const description = locale.ticket.closing.description.replace('{seconds}', String(seconds)) +
      (reason ? `\n${locale.ticket.closing.reason.replace('{reason}', reason)}` : '');

    return new EmbedBuilder()
      .setTitle(locale.ticket.closing.title)
      .setDescription(description)
      .setColor(this.colors.danger)
      .setTimestamp();
  }

  createClosedDMEmbed(locale: Locale, ticketId: number): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(locale.ticket.closed.title)
      .setDescription(locale.ticket.closed.description.replace('{id}', String(ticketId)))
      .setColor(this.colors.info)
      .setTimestamp();
  }

  createLimitReachedEmbed(locale: Locale, count: number, max: number): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(locale.ticket.limitReached.title)
      .setDescription(locale.ticket.limitReached.description.replace('{count}', String(count)).replace('{max}', String(max)))
      .setColor(this.colors.warning);
  }

  createLogEmbed(type: 'created' | 'closed', data: Ticket, locale: Locale): EmbedBuilder | null {
    // Only log closures now
    if (type === 'closed') {
      return new EmbedBuilder()
        .setTitle(locale.logs.ticketClosed.title)
        .setColor(this.colors.danger)
        .addFields(
          { name: locale.logs.ticketClosed.fields.ticketId, value: `#${data.id}`, inline: true },
          { name: locale.logs.ticketClosed.fields.closedBy, value: `<@${data.closedBy}>`, inline: true }
        )
        .setTimestamp();
    }

    return null;
  }

  createFeedbackRequestEmbed(locale: Locale, moderatorId: string): EmbedBuilder {
    const isRu = locale.languageCode === 'ru';

    return new EmbedBuilder()
      .setTitle(isRu ? 'Оцените работу поддержки' : 'Rate Support Quality')
      .setDescription(
        isRu
          ? `Вас обслуживал: <@${moderatorId}>\nКак вы оцените его работу?\n\nДоступно 10 минут`
          : `You were helped by: <@${moderatorId}>\nHow would you rate their work?\n\nAvailable for 10 minutes`
      )
      .setColor(this.colors.primary)
      .setTimestamp();
  }

  createFeedbackButtons(moderatorId: string, ticketId: number): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`feedback_positive_${moderatorId}_${ticketId}`)
          .setLabel('+rep')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`feedback_negative_${moderatorId}_${ticketId}`)
          .setLabel('-rep')
          .setStyle(ButtonStyle.Danger)
      );
  }

  createFeedbackDisabledButtons(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('feedback_disabled_pos')
          .setLabel('+rep')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('feedback_disabled_neg')
          .setLabel('-rep')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
  }

  createFeedbackLogEmbed(feedback: Feedback, locale: Locale): EmbedBuilder {
    const isRu = locale.languageCode === 'ru';
    const isPositive = feedback.rating === 'positive';

    return new EmbedBuilder()
      .setTitle(isRu ? 'Новый отзыв' : 'New Feedback')
      .setColor(isPositive ? this.colors.success : this.colors.danger)
      .addFields(
        {
          name: isRu ? 'Игрок' : 'Player',
          value: `<@${feedback.userId}>`,
          inline: true
        },
        {
          name: isRu ? 'Оценка' : 'Rating',
          value: isPositive ? '+rep' : '-rep',
          inline: true
        },
        {
          name: isRu ? 'Модератор' : 'Moderator',
          value: `<@${feedback.moderatorId}>`,
          inline: true
        },
        {
          name: isRu ? 'Тикет' : 'Ticket',
          value: `#${feedback.ticketId}`,
          inline: true
        },
        {
          name: isRu ? 'Комментарий' : 'Comment',
          value: feedback.comment || (isRu ? 'Без комментария' : 'No comment'),
          inline: false
        }
      )
      .setTimestamp();
  }

  createFeedbackThanksEmbed(locale: Locale, isPositive: boolean): EmbedBuilder {
    const isRu = locale.languageCode === 'ru';

    return new EmbedBuilder()
      .setTitle(isRu ? 'Спасибо за отзыв' : 'Thank you for your feedback')
      .setDescription(
        isRu
          ? `Ваша оценка: ${isPositive ? '+rep' : '-rep'}`
          : `Your rating: ${isPositive ? '+rep' : '-rep'}`
      )
      .setColor(isPositive ? this.colors.success : this.colors.danger)
      .setTimestamp();
  }

  createErrorEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
      .setDescription(message)
      .setColor(this.colors.danger);
  }

  createSuccessEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
      .setDescription(message)
      .setColor(this.colors.success);
  }

  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

export default new EmbedBuilderUtil();
