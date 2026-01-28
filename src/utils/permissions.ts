import {
  PermissionFlagsBits,
  ChannelType,
  Guild,
  GuildMember,
  TextChannel,
  CategoryChannel,
  OverwriteResolvable
} from 'discord.js';
import {
  getConfig
} from './dataManager';
import { TicketTypeConfig, RoleKey } from '../types';

class PermissionsUtil {
  async setTicketPermissions(
    channel: TextChannel,
    userId: string,
    ticketType: TicketTypeConfig,
    guild: Guild
  ): Promise<TextChannel> {
    const config = getConfig();

    const permissionOverwrites: OverwriteResolvable[] = [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: userId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks
        ]
      }
    ];

    for (const roleKey of ticketType.accessRoles) {
      const roleId = this.getRoleId(roleKey, config);
      if (roleId) {
        permissionOverwrites.push({
          id: roleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.ManageMessages
          ]
        });
      }
    }

    await channel.permissionOverwrites.set(permissionOverwrites);
    return channel;
  }

  private getRoleId(roleKey: RoleKey, config: ReturnType<typeof getConfig>): string | null {
    switch (roleKey) {
      case 'admin': return config.roles.admin || null;
      case 'seniorModerator': return config.roles.seniorModerator || null;
      case 'moderator': return config.roles.moderator || null;
      case 'helper': return config.roles.helper || null;
      case 'builder': return config.roles.builder || null;
      case 'eventManager': return config.roles.eventManager || null;
      default: return null;
    }
  }

  async addUserToTicket(channel: TextChannel, userId: string): Promise<void> {
    await channel.permissionOverwrites.create(userId, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
      AttachFiles: true,
      EmbedLinks: true
    });
  }

  async removeUserFromTicket(channel: TextChannel, userId: string): Promise<void> {
    await channel.permissionOverwrites.delete(userId);
  }

  async createCategory(guild: Guild, name: string, position: number): Promise<CategoryChannel> {
    const config = getConfig();
    const existingCategory = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name === name
    ) as CategoryChannel | undefined;

    if (existingCategory) {
      return existingCategory;
    }

    const permissionOverwrites: OverwriteResolvable[] = [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      }
    ];

    const staffRoles: RoleKey[] = ['admin', 'seniorModerator', 'moderator', 'helper'];
    for (const roleKey of staffRoles) {
      const roleId = this.getRoleId(roleKey, config);
      if (roleId) {
        permissionOverwrites.push({
          id: roleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages
          ]
        });
      }
    }

    const category = await guild.channels.create({
      name,
      type: ChannelType.GuildCategory,
      position,
      permissionOverwrites
    });

    return category;
  }

  async createTicketChannel(
    guild: Guild,
    name: string,
    categoryId: string,
    userId: string,
    ticketType: TicketTypeConfig
  ): Promise<TextChannel> {
    const channel = await guild.channels.create({
      name,
      type: ChannelType.GuildText,
      parent: categoryId,
      topic: `Ticket by <@${userId}> | Type: ${ticketType.id}`
    });

    await this.setTicketPermissions(channel, userId, ticketType, guild);
    return channel;
  }

  hasAdminPermission(member: GuildMember): boolean {
    const adminRoleId = process.env.ADMIN_ROLE_ID;
    if (adminRoleId && member.roles.cache.has(adminRoleId)) {
      return true;
    }
    return member.permissions.has(PermissionFlagsBits.Administrator);
  }

  hasModPermission(member: GuildMember): boolean {
    const config = getConfig();
    const modRoles: RoleKey[] = ['admin', 'seniorModerator', 'moderator', 'helper'];

    const adminRoleId = process.env.ADMIN_ROLE_ID;
    if (adminRoleId && member.roles.cache.has(adminRoleId)) {
      return true;
    }

    return modRoles.some(roleKey => {
      const roleId = this.getRoleId(roleKey, config);
      return roleId && member.roles.cache.has(roleId);
    });
  }

  hasSeniorPermission(member: GuildMember): boolean {
    const config = getConfig();
    const seniorRoles: RoleKey[] = ['admin', 'seniorModerator'];

    return seniorRoles.some(roleKey => {
      const roleId = this.getRoleId(roleKey, config);
      return roleId && member.roles.cache.has(roleId);
    });
  }

  getRoleMentions(ticketType: TicketTypeConfig): string {
    const config = getConfig();
    const mentions: string[] = [];

    for (const roleKey of ticketType.pingRoles) {
      const roleId = this.getRoleId(roleKey, config);
      if (roleId) {
        mentions.push(`<@&${roleId}>`);
      }
    }

    return mentions.join(' ');
  }

  getSeniorMentions(): string {
    const config = getConfig();
    const mentions: string[] = [];

    const seniorRoles: RoleKey[] = ['seniorModerator', 'admin'];
    for (const roleKey of seniorRoles) {
      const roleId = this.getRoleId(roleKey, config);
      if (roleId) {
        mentions.push(`<@&${roleId}>`);
      }
    }

    return mentions.join(' ');
  }

  async createStaffChannel(
    guild: Guild,
    name: string,
    categoryId?: string
  ): Promise<TextChannel> {
    const config = getConfig();

    const existingChannel = guild.channels.cache.find(
      c => c.type === ChannelType.GuildText && c.name === name
    ) as TextChannel | undefined;

    if (existingChannel) {
      return existingChannel;
    }

    const permissionOverwrites: OverwriteResolvable[] = [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel]
      }
    ];

    const staffRoles: RoleKey[] = ['admin', 'seniorModerator', 'moderator', 'helper'];
    for (const roleKey of staffRoles) {
      const roleId = this.getRoleId(roleKey, config);
      if (roleId) {
        permissionOverwrites.push({
          id: roleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks
          ]
        });
      }
    }

    const channelOptions: {
      name: string;
      type: ChannelType.GuildText;
      permissionOverwrites: OverwriteResolvable[];
      parent?: string;
    } = {
      name,
      type: ChannelType.GuildText,
      permissionOverwrites
    };

    if (categoryId) {
      channelOptions.parent = categoryId;
    }

    const channel = await guild.channels.create(channelOptions);
    return channel;
  }

  async createPublicChannel(
    guild: Guild,
    name: string,
    categoryId?: string
  ): Promise<TextChannel> {
    // Check if channel already exists
    const existingChannel = guild.channels.cache.find(
      c => c.type === ChannelType.GuildText && c.name === name
    ) as TextChannel | undefined;

    if (existingChannel) {
      return existingChannel;
    }

    const channelOptions: {
      name: string;
      type: ChannelType.GuildText;
      parent?: string;
    } = {
      name,
      type: ChannelType.GuildText
    };

    if (categoryId) {
      channelOptions.parent = categoryId;
    }

    const channel = await guild.channels.create(channelOptions);
    return channel;
  }
}

export default new PermissionsUtil();
