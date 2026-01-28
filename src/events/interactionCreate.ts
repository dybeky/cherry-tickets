import {
  Interaction,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
  ButtonInteraction
} from 'discord.js';
import selectMenuHandler from '../handlers/selectMenuHandler';
import modalHandler from '../handlers/modalHandler';
import buttonHandler from '../handlers/buttonHandler';
import embedBuilder from '../utils/embedBuilder';
import logger from '../utils/logger';
import { Event, ExtendedClient, Command } from '../types';

const event: Event = {
  name: 'interactionCreate',

  async execute(interaction: Interaction, client: ExtendedClient): Promise<void> {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          logger.warn(`Command not found: ${interaction.commandName}`);
          return;
        }

        logger.command(interaction.commandName, interaction.user.id);
        await command.execute(interaction);
      }

      else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);

        if (!command || !command.autocomplete) {
          return;
        }

        await command.autocomplete(interaction);
      }

      else if (interaction.isStringSelectMenu()) {
        await selectMenuHandler.handle(interaction);
      }

      else if (interaction.isModalSubmit()) {
        await modalHandler.handle(interaction);
      }

      else if (interaction.isButton()) {
        await buttonHandler.handle(interaction);
      }
    } catch (error) {
      const err = error as Error;

      if (interaction.isChatInputCommand()) {
        logger.error(`Command error: /${interaction.commandName}`, err);
      } else if (interaction.isButton()) {
        logger.error(`Button error: ${interaction.customId}`, err);
      } else if (interaction.isStringSelectMenu()) {
        logger.error(`SelectMenu error: ${interaction.customId}`, err);
      } else if (interaction.isModalSubmit()) {
        logger.error(`Modal error: ${interaction.customId}`, err);
      } else {
        logger.error('Interaction error', err);
      }

      const errorEmbed = embedBuilder.createErrorEmbed('An error occurred. Please try again later.');

      if (interaction.isRepliable()) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            embeds: [errorEmbed],
            ephemeral: true
          }).catch(() => {});
        } else {
          await interaction.reply({
            embeds: [errorEmbed],
            ephemeral: true
          }).catch(() => {});
        }
      }
    }
  }
};

module.exports = event;
export default event;
