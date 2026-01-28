import 'dotenv/config';

import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Command, Event, ExtendedClient } from './types';
import logger from './utils/logger';

logger.startup();

logger.validateConfig();

import { initDataManager } from './utils/dataManager';
const dataPath = path.join(__dirname, '..', 'data');

try {
  initDataManager(dataPath);
  logger.info('Data manager initialized');
} catch (error) {
  logger.error('Data manager init failed', error as Error);
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember
  ]
}) as ExtendedClient;

client.commands = new Collection<string, Command>();

const commandsPath = path.join(__dirname, 'commands');
let loadedCommands = 0;

try {
  const commandFiles = fs.readdirSync(commandsPath).filter(file =>
    (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
  );

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command = require(filePath) as Command;

      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        loadedCommands++;
      }
    } catch (error) {
      logger.error(`Command load failed: ${file}`, error as Error);
    }
  }

  logger.info(`Commands loaded: ${loadedCommands}`);
} catch (error) {
  logger.error('Commands load failed', error as Error);
}

const eventsPath = path.join(__dirname, 'events');
let loadedEvents = 0;

try {
  const eventFiles = fs.readdirSync(eventsPath).filter(file =>
    (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
  );

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const event = require(filePath) as Event;

      if (event.once) {
        client.once(event.name, (...args: unknown[]) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args: unknown[]) => event.execute(...args, client));
      }

      loadedEvents++;
    } catch (error) {
      logger.error(`Event load failed: ${file}`, error as Error);
    }
  }

  logger.info(`Events loaded: ${loadedEvents}`);
} catch (error) {
  logger.error('Events load failed', error as Error);
}

process.on('unhandledRejection', (error: Error) => {
  if (error?.message?.includes('EPIPE')) return;
  logger.error('Unhandled rejection', error);
});

process.on('uncaughtException', (error: Error) => {
  if (error?.message?.includes('EPIPE')) return;
  logger.error('Uncaught exception', error);
});

client.on('error', (error: Error) => {
  logger.discordError('client error', error);
});

client.on('warn', (message: string) => {
  logger.warn(`Discord: ${message}`);
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
  logger.error('DISCORD_TOKEN not set!');
  process.exit(1);
}

logger.info('Connecting to Discord...');

client.login(token)
  .then(() => {
    logger.info('Connected to Discord');
  })
  .catch((error: Error) => {
    logger.error('Discord connection failed', error);
    process.exit(1);
  });
