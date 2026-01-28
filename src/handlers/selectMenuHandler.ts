import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuInteraction
} from 'discord.js';
import embedBuilder, { SERVERS } from '../utils/embedBuilder';
import { getTicketType } from '../config/ticketTypes';
import { getLocale } from '../locales';
import logger from '../utils/logger';
import { LanguageCode } from '../types';

class SelectMenuHandler {
  private getLocaleByCode(lang: string) {
    return getLocale(lang as LanguageCode);
  }

  async handleLanguageSelect(interaction: StringSelectMenuInteraction): Promise<void> {
    const lang = interaction.values[0];
    logger.info(`Language selected: ${lang} by ${interaction.user.id}`);

    const locale = this.getLocaleByCode(lang);

    const formEmbed = embedBuilder.createTicketFormEmbed(locale, lang);
    const serverMenu = embedBuilder.createServerSelectMenu(lang);
    const categoryMenu = embedBuilder.createCategorySelectMenu(locale, lang);

    await interaction.reply({
      embeds: [formEmbed],
      components: [serverMenu, categoryMenu],
      ephemeral: true
    });
  }

  async handleServerSelect(interaction: StringSelectMenuInteraction, lang: string): Promise<void> {
    const serverId = interaction.values[0];
    logger.info(`Server selected: ${serverId} by ${interaction.user.id}`);

    const locale = this.getLocaleByCode(lang);
    const isRu = lang === 'ru';

    const serverInfo = SERVERS.find(s => s.id === serverId);
    const serverName = serverInfo?.name || serverId;

    const updatedEmbed = embedBuilder.createTicketFormEmbed(locale, lang)
      .addFields({
        name: isRu ? 'Выбранный сервер' : 'Selected server',
        value: serverName,
        inline: true
      });

    const serverMenu = embedBuilder.createServerSelectMenu(lang);
    const categoryMenu = embedBuilder.createCategorySelectMenu(locale, lang, serverId);

    await interaction.update({
      embeds: [updatedEmbed],
      components: [serverMenu, categoryMenu]
    });
  }

  async handleCategorySelect(interaction: StringSelectMenuInteraction): Promise<void> {
    const value = interaction.values[0];
    logger.info(`Category selected: ${value} by ${interaction.user.id}`);

    const parts = value.split('_');
    let ticketTypeId: string;
    let serverId: string | undefined;
    let lang: string;

    lang = parts[parts.length - 1];

    // Проверяем, есть ли сервер (сервер - предпоследний элемент, если есть)
    const possibleServerId = parts[parts.length - 2];
    const serverIds = ['russia', 'pei', 'washington'];

    if (serverIds.includes(possibleServerId)) {
      serverId = possibleServerId;
      ticketTypeId = parts.slice(0, -2).join('_');
    } else {
      ticketTypeId = parts.slice(0, -1).join('_');
    }

    logger.debug(`Parsed category: ticketTypeId=${ticketTypeId}, serverId=${serverId}, lang=${lang}`);

    const locale = this.getLocaleByCode(lang);
    const ticketType = getTicketType(ticketTypeId);

    if (!ticketType) {
      logger.error(`Ticket type not found: ${ticketTypeId}`);
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.generic)],
        ephemeral: true
      });
      return;
    }

    const modalLocale = locale.modals[ticketTypeId];
    if (!modalLocale) {
      logger.error(`Modal locale not found: ${ticketTypeId}`);
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.generic)],
        ephemeral: true
      });
      return;
    }

    // Создаём модалку с сервером в customId
    const customId = serverId
      ? `ticket_modal_${ticketTypeId}_${serverId}_${lang}`
      : `ticket_modal_${ticketTypeId}_${lang}`;

    const modal = new ModalBuilder()
      .setCustomId(customId)
      .setTitle(modalLocale.title);

    const rows: ActionRowBuilder<TextInputBuilder>[] = [];
    for (const field of ticketType.modalFields) {
      const fieldLocale = modalLocale.fields[field.id];
      if (!fieldLocale) {
        logger.warn(`Field locale not found: ${field.id}`);
        continue;
      }

      const textInput = new TextInputBuilder()
        .setCustomId(field.id)
        .setLabel(fieldLocale.label.substring(0, 45))
        .setPlaceholder(fieldLocale.placeholder || '')
        .setStyle(field.style === 'PARAGRAPH' ? TextInputStyle.Paragraph : TextInputStyle.Short)
        .setRequired(field.required)
        .setMaxLength(field.maxLength || 1000);

      if (field.style === 'PARAGRAPH') {
        textInput.setMinLength(field.required ? 10 : 0);
      }

      rows.push(new ActionRowBuilder<TextInputBuilder>().addComponents(textInput));

      if (rows.length >= 5) break;
    }

    modal.addComponents(...rows);

    logger.debug(`Showing modal: ${ticketTypeId} for ${interaction.user.id}`);

    await interaction.showModal(modal);
  }

  async handle(interaction: StringSelectMenuInteraction): Promise<void> {
    const customId = interaction.customId;
    logger.debug(`SelectMenu: ${customId}`);

    try {
      if (customId === 'ticket_language_select') {
        await this.handleLanguageSelect(interaction);
      } else if (customId.startsWith('ticket_server_select_')) {
        // ticket_server_select_ru -> lang = ru
        const lang = customId.split('_').pop() || 'ru';
        await this.handleServerSelect(interaction, lang);
      } else if (customId === 'ticket_category_select') {
        await this.handleCategorySelect(interaction);
      } else {
        logger.warn(`Unknown customId: ${customId}`);
      }
    } catch (error) {
      logger.error(`SelectMenuHandler error: ${customId}`, error as Error);
      // Don't re-throw - error is already logged and will be handled by interaction error handler
    }
  }
}

export default new SelectMenuHandler();
