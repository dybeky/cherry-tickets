import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  GuildMember
} from 'discord.js';
import { resetTickets } from '../utils/dataManager';
import embedBuilder from '../utils/embedBuilder';
import permissions from '../utils/permissions';
import { getLocale } from '../locales';
import logger from '../utils/logger';
import { Command } from '../types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset the ticket counter to zero (deletes all ticket records)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const locale = getLocale('ru');
    const member = interaction.member as GuildMember;

    if (!permissions.hasAdminPermission(member)) {
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.commands.setup.noPermission)],
        ephemeral: true
      });
      return;
    }

    try {
      resetTickets();
      logger.info(`Ticket counter reset by ${interaction.user.id}`);

      const isRu = locale.languageCode === 'ru';
      await interaction.reply({
        embeds: [embedBuilder.createSuccessEmbed(
          isRu
            ? 'Счетчик тикетов сброшен. Следующий тикет будет #1.'
            : 'Ticket counter reset. Next ticket will be #1.'
        )],
        ephemeral: true
      });
    } catch (error) {
      logger.error('Error resetting ticket counter', error as Error);
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.generic)],
        ephemeral: true
      });
    }
  }
};

module.exports = command;
export default command;
