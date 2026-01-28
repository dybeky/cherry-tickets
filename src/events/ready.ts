import { ActivityType, Client } from 'discord.js';
import { removeInvalidTickets, getTickets } from '../utils/dataManager';
import logger from '../utils/logger';
import { Event, ExtendedClient } from '../types';

const event: Event = {
  name: 'ready',
  once: true,

  async execute(client: ExtendedClient): Promise<void> {
    logger.info(`Bot ready: ${client.user?.tag} | ${client.guilds.cache.size} guild(s)`);

    client.user?.setActivity('tickets | /setup', { type: ActivityType.Watching });

    try {
      const tickets = getTickets();
      const openTickets = tickets.filter(t => t.status === 'open' && t.channelId);
      const validChannelIds: string[] = [];

      for (const ticket of openTickets) {
        if (!ticket.channelId) continue;
        try {
          const channel = await client.channels.fetch(ticket.channelId);
          if (channel) {
            validChannelIds.push(ticket.channelId);
          }
        } catch {
        }
      }

      const removed = removeInvalidTickets(validChannelIds);
      if (removed > 0) {
        logger.warn(`Removed ${removed} invalid tickets`);
      }
    } catch (error) {
      logger.error('Ticket validation error', error as Error);
    }
  }
};

module.exports = event;
export default event;
