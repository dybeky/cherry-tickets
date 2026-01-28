import {
  TextChannel,
  User,
  AttachmentBuilder
} from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import * as discordTranscripts from 'discord-html-transcripts';
import logger from './logger';

class TranscriptGenerator {
  async generateTranscript(
    channel: TextChannel,
    options: { filename?: string } = {}
  ): Promise<AttachmentBuilder | null> {
    try {
      const filename = options.filename || `transcript-${channel.name}-${Date.now()}.html`;

      const attachment = await discordTranscripts.createTranscript(channel, {
        filename,
        saveImages: false,
        footerText: 'Unturned Server - Ticket Transcript',
        poweredBy: false
      });

      return attachment;
    } catch (error) {
      logger.error('Error generating transcript', error as Error);
      return null;
    }
  }

  async sendTranscriptToChannel(
    channel: TextChannel,
    transcript: AttachmentBuilder | null,
    embed?: EmbedBuilder
  ): Promise<boolean> {
    try {
      await channel.send({
        embeds: embed ? [embed] : [],
        files: transcript ? [transcript] : []
      });
      return true;
    } catch (error) {
      logger.error('Error sending transcript to channel', error as Error);
      return false;
    }
  }

  async sendTranscriptToUser(
    user: User,
    transcript: AttachmentBuilder | null,
    embed?: EmbedBuilder
  ): Promise<boolean> {
    try {
      await user.send({
        embeds: embed ? [embed] : [],
        files: transcript ? [transcript] : []
      });
      return true;
    } catch (error) {
      logger.error('Error sending transcript to user', error as Error);
      return false;
    }
  }
}

export default new TranscriptGenerator();
