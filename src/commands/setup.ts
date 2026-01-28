import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  TextChannel,
  GuildMember,
  ChannelType
} from 'discord.js';
import { setChannel, getChannel, setCategory, getCategory } from '../utils/dataManager';
import embedBuilder from '../utils/embedBuilder';
import permissions from '../utils/permissions';
import { getCategoryTypes } from '../config/ticketTypes';
import { getLocale } from '../locales';
import logger from '../utils/logger';
import { Command } from '../types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup the ticket system (creates channels, categories and panel)')
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

    const results: string[] = [];
    let createdChannels = 0;
    let createdCategories = 0;

    try {
      const existingPanelId = getChannel('ticketPanel');
      let panelChannel: TextChannel | null = null;

      if (existingPanelId) {
        try {
          panelChannel = await guild.channels.fetch(existingPanelId) as TextChannel;
        } catch {
          panelChannel = null;
        }
      }

      if (!panelChannel) {
        panelChannel = await permissions.createPublicChannel(guild, 'ticket-panel');
        setChannel('ticketPanel', panelChannel.id);
        createdChannels++;
        results.push(`ticket-panel: created`);
      } else {
        results.push(`ticket-panel: exists`);
      }

      const messages = await panelChannel.messages.fetch({ limit: 50 });
      const botMessages = messages.filter(m =>
        m.author.id === guild.client.user?.id &&
        m.embeds.length > 0 &&
        m.components.length > 0
      );

      if (botMessages.size === 0) {
        const panelEmbed = embedBuilder.createPanelEmbed();
        const ticketButton = embedBuilder.createTicketButton();
        await panelChannel.send({
          embeds: [panelEmbed],
          components: [ticketButton]
        });
        results.push(`panel embed: sent`);
      } else {
        results.push(`panel embed: already exists`);
      }
    } catch (err) {
      logger.error('Failed to create ticket-panel', err as Error);
      results.push(`ticket-panel: failed`);
    }

    try {
      const existingLogsId = getChannel('ticketLogs');
      let logsChannel: TextChannel | null = null;

      if (existingLogsId) {
        try {
          logsChannel = await guild.channels.fetch(existingLogsId) as TextChannel;
        } catch {
          logsChannel = null;
        }
      }

      if (!logsChannel) {
        logsChannel = await permissions.createStaffChannel(guild, 'ticket-logs');
        setChannel('ticketLogs', logsChannel.id);
        createdChannels++;
        results.push(`ticket-logs: created`);
      } else {
        results.push(`ticket-logs: exists`);
      }
    } catch (err) {
      logger.error('Failed to create ticket-logs', err as Error);
      results.push(`ticket-logs: failed`);
    }

    try {
      const existingFeedbackId = getChannel('feedbackLogs');
      let feedbackChannel: TextChannel | null = null;

      if (existingFeedbackId) {
        try {
          feedbackChannel = await guild.channels.fetch(existingFeedbackId) as TextChannel;
        } catch {
          feedbackChannel = null;
        }
      }

      if (!feedbackChannel) {
        feedbackChannel = await permissions.createStaffChannel(guild, 'feedback-logs');
        setChannel('feedbackLogs', feedbackChannel.id);
        createdChannels++;
        results.push(`feedback-logs: created`);
      } else {
        results.push(`feedback-logs: exists`);
      }
    } catch (err) {
      logger.error('Failed to create feedback-logs', err as Error);
      results.push(`feedback-logs: failed`);
    }

    const categoryTypes = getCategoryTypes();

    for (const [key, categoryInfo] of Object.entries(categoryTypes)) {
      try {
        const existingCategoryId = getCategory(key);
        let category = null;

        if (existingCategoryId) {
          try {
            category = await guild.channels.fetch(existingCategoryId);
          } catch {
            category = null;
          }
        }

        if (!category) {
          category = await permissions.createCategory(guild, categoryInfo.name, categoryInfo.position);
          createdCategories++;
        }

        setCategory(key, category.id);
      } catch {
        // Continue with other categories
      }
    }

    if (createdCategories > 0) {
      results.push(`categories: ${createdCategories} created`);
    } else {
      results.push(`categories: all exist`);
    }

    // Build response
    const responseText = [
      `Setup completed`,
      ``,
      `Channels:`,
      ...results.filter(r => !r.startsWith('categories') && !r.startsWith('panel embed')),
      ``,
      `Panel: ${results.find(r => r.startsWith('panel embed')) || 'unknown'}`,
      `Categories: ${createdCategories > 0 ? `${createdCategories} created` : 'all exist'}`
    ].join('\n');

    logger.info(`Setup completed: ${createdChannels} channels, ${createdCategories} categories`);

    await interaction.editReply({
      embeds: [embedBuilder.createSuccessEmbed(responseText)]
    });
  }
};

module.exports = command;
export default command;
