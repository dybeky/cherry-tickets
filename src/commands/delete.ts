import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  GuildMember,
  ChannelType,
  CategoryChannel
} from 'discord.js';
import { getConfig, getChannel, setChannel, resetTickets, resetCategories } from '../utils/dataManager';
import embedBuilder from '../utils/embedBuilder';
import permissions from '../utils/permissions';
import { getLocale } from '../locales';
import logger from '../utils/logger';
import { Command } from '../types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete all bot-created channels, categories and reset data')
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

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply({
        embeds: [embedBuilder.createErrorEmbed(locale.errors.generic)]
      });
      return;
    }

    const config = getConfig();
    let deletedChannels = 0;
    let deletedCategories = 0;
    const results: string[] = [];

    const botChannels = [
      { key: 'ticketPanel', name: 'ticket-panel' },
      { key: 'ticketLogs', name: 'ticket-logs' },
      { key: 'feedbackLogs', name: 'feedback-logs' }
    ];

    for (const { key, name } of botChannels) {
      const channelId = getChannel(key);
      if (channelId) {
        try {
          const channel = await guild.channels.fetch(channelId);
          if (channel) {
            await channel.delete();
            deletedChannels++;
            results.push(`${name}: deleted`);
          }
        } catch {
          results.push(`${name}: not found`);
        }
        setChannel(key, '');
      }
    }

    const categoryKeys = ['cheaters', 'staffComplaints', 'playerComplaints', 'gameQuestions', 'techSupport', 'applications'] as const;

    for (const key of categoryKeys) {
      const categoryId = config.categories[key];
      if (!categoryId) continue;

      try {
        const category = await guild.channels.fetch(categoryId) as CategoryChannel | null;
        if (category && category.type === ChannelType.GuildCategory) {
          const channels = category.children.cache;
          for (const [, channel] of channels) {
            try {
              await channel.delete();
              deletedChannels++;
            } catch {
            }
          }

          await category.delete();
          deletedCategories++;
        }
      } catch {
      }
    }

    if (deletedCategories > 0) {
      results.push(`categories: ${deletedCategories} deleted`);
    }

    resetCategories();
    resetTickets();
    results.push('data: reset');

    logger.info(`Delete command: ${deletedChannels} channels, ${deletedCategories} categories`);

    const responseText = [
      'Cleanup completed',
      '',
      ...results
    ].join('\n');

    await interaction.editReply({
      embeds: [embedBuilder.createSuccessEmbed(responseText)]
    });
  }
};

module.exports = command;
export default command;
