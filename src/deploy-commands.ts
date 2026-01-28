import 'dotenv/config';

import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from './types';

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file =>
  (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts')
);

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const command = require(filePath) as Command;

  if ('data' in command) {
    commands.push(command.data.toJSON());
    console.log(`Prepared command: ${command.data.name}`);
  } else {
    console.log(`The command at ${filePath} is missing "data" property.`);
  }
}

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('DISCORD_TOKEN or CLIENT_ID is not set in .env file!');
  process.exit(1);
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    let data: unknown[];

    if (guildId) {
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      ) as unknown[];
      console.log(`Successfully registered ${data.length} guild commands.`);
    } else {
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      ) as unknown[];
      console.log(`Successfully registered ${data.length} global commands.`);
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();
