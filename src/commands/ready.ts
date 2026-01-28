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
import logger from '../utils/logger';
import { Command } from '../types';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ready')
    .setDescription('Request feedback from the ticket creator')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The ticket creator to request feedback from')
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

    if (!ticket || targetUser.id !== ticket.userId) {
      const isRu = locale.languageCode === 'ru';
      await interaction.reply({
        embeds: [embedBuilder.createErrorEmbed(
          isRu
            ? 'Указанный пользователь не является создателем этого тикета.'
            : 'The specified user is not the creator of this ticket.'
        )],
        ephemeral: true
      });
      return;
    }

    const feedbackEmbed = embedBuilder.createFeedbackRequestEmbed(locale, interaction.user.id);
    const feedbackButtons = embedBuilder.createFeedbackButtons(interaction.user.id, ticket.id);

    const feedbackMessage = await channel.send({
      content: `<@${targetUser.id}>`,
      embeds: [feedbackEmbed],
      components: [feedbackButtons]
    });

    setTimeout(async () => {
      try {
        const disabledButtons = embedBuilder.createFeedbackDisabledButtons();
        await feedbackMessage.edit({
          components: [disabledButtons]
        });
      } catch {
      }
    }, 10 * 60 * 1000);

    const isRu = locale.languageCode === 'ru';
    await interaction.reply({
      embeds: [embedBuilder.createSuccessEmbed(
        isRu
          ? 'Запрос на оценку отправлен пользователю.'
          : 'Feedback request sent to the user.'
      )],
      ephemeral: true
    });

    logger.info(`Feedback requested in ticket #${ticket.id} by ${interaction.user.id}`);
  }
};

module.exports = command;
export default command;
