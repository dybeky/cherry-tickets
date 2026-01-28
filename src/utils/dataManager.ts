import * as fs from 'fs';
import * as path from 'path';
import {
  Config,
  RolesConfig,
  CategoriesConfig,
  ChannelsConfig,
  Ticket,
  TicketsStore,
  SnippetsStore,
  FormData,
  Feedback,
  FeedbackStore
} from '../types';
import logger from './logger';

interface TicketCreateData {
  type: string;
  userId: string;
  guildId: string;
  channelId: string | null;
  language: string;
  server?: string;
  formData: FormData | null;
}

interface TicketUpdate {
  channelId?: string;
  status?: 'open' | 'closed';
  claimedBy?: string;
  claimedAt?: string;
  rating?: number;
  closedBy?: string;
  closeReason?: string;
  closedAt?: string;
}

class DataManager {
  private dataPath: string = '';
  private config: Config = this.getDefaultConfig();
  private tickets: TicketsStore = { tickets: [], counter: 0 };
  private snippets: SnippetsStore = { snippets: {} };
  private feedbackStore: FeedbackStore = { feedback: [], counter: 0 };

  private ticketByChannel: Map<string, number> = new Map();
  private ticketByUser: Map<string, number[]> = new Map();

  private ticketCreationLock: boolean = false;
  private ticketCreationQueue: Array<() => void> = [];

  private getDefaultConfig(): Config {
    return {
      roles: {
        admin: '',
        seniorModerator: '',
        moderator: '',
        helper: '',
        builder: '',
        eventManager: ''
      },
      categories: {
        cheaters: '',
        staffComplaints: '',
        playerComplaints: '',
        gameQuestions: '',
        techSupport: '',
        applications: ''
      },
      channels: {
        ticketLogs: '',
        ticketPanel: '',
        feedbackLogs: ''
      },
      settings: {
        maxTicketsPerUser: 2,
        ticketDeleteDelay: 10000,
        pingDeleteDelay: 5000
      }
    };
  }

  private nowISO(): string {
    return new Date().toISOString();
  }

  // Simple mutex implementation for ticket creation
  private async acquireTicketLock(): Promise<void> {
    if (!this.ticketCreationLock) {
      this.ticketCreationLock = true;
      return;
    }

    return new Promise((resolve) => {
      this.ticketCreationQueue.push(resolve);
    });
  }

  private releaseTicketLock(): void {
    const next = this.ticketCreationQueue.shift();
    if (next) {
      next();
    } else {
      this.ticketCreationLock = false;
    }
  }

  private rebuildIndexes(): void {
    this.ticketByChannel.clear();
    this.ticketByUser.clear();

    this.tickets.tickets.forEach((ticket, idx) => {
      if (ticket.channelId) {
        this.ticketByChannel.set(ticket.channelId, idx);
      }
      if (ticket.status === 'open') {
        const userTickets = this.ticketByUser.get(ticket.userId) || [];
        userTickets.push(idx);
        this.ticketByUser.set(ticket.userId, userTickets);
      }
    });
  }

  private saveConfigToFile(): boolean {
    try {
      const filePath = path.join(this.dataPath, 'config.json');
      fs.writeFileSync(filePath, JSON.stringify(this.config, null, 2));
      return true;
    } catch (error) {
      logger.error('Error saving config', error as Error);
      return false;
    }
  }

  private saveTicketsToFile(): boolean {
    try {
      const filePath = path.join(this.dataPath, 'tickets.json');
      fs.writeFileSync(filePath, JSON.stringify(this.tickets, null, 2));
      return true;
    } catch (error) {
      logger.error('Error saving tickets', error as Error);
      return false;
    }
  }

  private saveSnippetsToFile(): boolean {
    try {
      const filePath = path.join(this.dataPath, 'snippets.json');
      fs.writeFileSync(filePath, JSON.stringify(this.snippets, null, 2));
      return true;
    } catch (error) {
      logger.error('Error saving snippets', error as Error);
      return false;
    }
  }

  init(dataPath: string): void {
    this.dataPath = dataPath;

    // Ensure data directory exists
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    // Load or create config
    const configPath = path.join(dataPath, 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const data = fs.readFileSync(configPath, 'utf-8');
        this.config = JSON.parse(data);
      } catch {
        this.config = this.getDefaultConfig();
        this.saveConfigToFile();
      }
    } else {
      this.config = this.getDefaultConfig();
      this.saveConfigToFile();
    }

    // Load or create tickets
    const ticketsPath = path.join(dataPath, 'tickets.json');
    if (fs.existsSync(ticketsPath)) {
      try {
        const data = fs.readFileSync(ticketsPath, 'utf-8');
        this.tickets = JSON.parse(data);
      } catch {
        this.tickets = { tickets: [], counter: 0 };
        this.saveTicketsToFile();
      }
    } else {
      this.tickets = { tickets: [], counter: 0 };
      this.saveTicketsToFile();
    }

    // Load or create snippets
    const snippetsPath = path.join(dataPath, 'snippets.json');
    if (fs.existsSync(snippetsPath)) {
      try {
        const data = fs.readFileSync(snippetsPath, 'utf-8');
        this.snippets = JSON.parse(data);
      } catch {
        this.snippets = { snippets: {} };
        this.saveSnippetsToFile();
      }
    } else {
      this.snippets = { snippets: {} };
      this.saveSnippetsToFile();
    }

    // Load or create feedback store
    this.loadFeedbackStore();

    this.rebuildIndexes();
  }

  getConfig(): Config {
    return { ...this.config };
  }

  saveConfig(config: Config): boolean {
    this.config = config;
    return this.saveConfigToFile();
  }

  getRole(roleKey: string): string | null {
    const validKeys: (keyof RolesConfig)[] = ['admin', 'seniorModerator', 'moderator', 'helper', 'builder', 'eventManager'];
    if (!validKeys.includes(roleKey as keyof RolesConfig)) {
      return null;
    }
    const role = this.config.roles[roleKey as keyof RolesConfig];
    return role && role !== '' ? role : null;
  }

  setRole(roleKey: string, roleId: string): boolean {
    const validKeys: (keyof RolesConfig)[] = ['admin', 'seniorModerator', 'moderator', 'helper', 'builder', 'eventManager'];
    if (!validKeys.includes(roleKey as keyof RolesConfig)) {
      return false;
    }
    (this.config.roles as { [K in keyof RolesConfig]: string })[roleKey as keyof RolesConfig] = roleId;
    return this.saveConfigToFile();
  }

  getCategory(categoryKey: string): string | null {
    const validKeys: (keyof CategoriesConfig)[] = ['cheaters', 'staffComplaints', 'playerComplaints', 'gameQuestions', 'techSupport', 'applications'];
    if (!validKeys.includes(categoryKey as keyof CategoriesConfig)) {
      return null;
    }
    const category = this.config.categories[categoryKey as keyof CategoriesConfig];
    return category && category !== '' ? category : null;
  }

  setCategory(categoryKey: string, categoryId: string): boolean {
    const validKeys: (keyof CategoriesConfig)[] = ['cheaters', 'staffComplaints', 'playerComplaints', 'gameQuestions', 'techSupport', 'applications'];
    if (!validKeys.includes(categoryKey as keyof CategoriesConfig)) {
      return false;
    }
    (this.config.categories as { [K in keyof CategoriesConfig]: string })[categoryKey as keyof CategoriesConfig] = categoryId;
    return this.saveConfigToFile();
  }

  getChannel(channelKey: string): string | null {
    const validKeys: (keyof ChannelsConfig)[] = ['ticketLogs', 'ticketPanel', 'feedbackLogs'];
    if (!validKeys.includes(channelKey as keyof ChannelsConfig)) {
      return null;
    }
    const channel = this.config.channels[channelKey as keyof ChannelsConfig];
    return channel && channel !== '' ? channel : null;
  }

  setChannel(channelKey: string, channelId: string): boolean {
    const validKeys: (keyof ChannelsConfig)[] = ['ticketLogs', 'ticketPanel', 'feedbackLogs'];
    if (!validKeys.includes(channelKey as keyof ChannelsConfig)) {
      return false;
    }
    (this.config.channels as { [K in keyof ChannelsConfig]: string })[channelKey as keyof ChannelsConfig] = channelId;
    return this.saveConfigToFile();
  }

  getSetting(settingKey: string): number | null {
    type SettingKey = 'maxTicketsPerUser' | 'ticketDeleteDelay' | 'pingDeleteDelay';
    const validKeys: SettingKey[] = ['maxTicketsPerUser', 'ticketDeleteDelay', 'pingDeleteDelay'];
    if (!validKeys.includes(settingKey as SettingKey)) {
      return null;
    }
    return this.config.settings[settingKey as SettingKey];
  }

  getTickets(): Ticket[] {
    return [...this.tickets.tickets];
  }

  getTicketById(ticketId: number): Ticket | null {
    return this.tickets.tickets.find(t => t.id === ticketId) || null;
  }

  getTicketByChannelId(channelId: string): Ticket | null {
    const idx = this.ticketByChannel.get(channelId);
    if (idx !== undefined) {
      return this.tickets.tickets[idx] || null;
    }
    return null;
  }

  getUserTickets(userId: string): Ticket[] {
    const indices = this.ticketByUser.get(userId) || [];
    return indices
      .map(idx => this.tickets.tickets[idx])
      .filter((t): t is Ticket => t !== undefined);
  }

  async createTicket(data: TicketCreateData): Promise<Ticket> {
    // Acquire lock to prevent race conditions with counter
    await this.acquireTicketLock();

    try {
      this.tickets.counter += 1;

      const ticket: Ticket = {
        id: this.tickets.counter,
        type: data.type,
        userId: data.userId,
        guildId: data.guildId,
        channelId: data.channelId,
        language: data.language,
        server: data.server,
        formData: data.formData,
        status: 'open',
        claimedBy: null,
        claimedAt: null,
        rating: null,
        createdAt: this.nowISO(),
        closedBy: undefined,
        closeReason: undefined,
        closedAt: undefined
      };

      const idx = this.tickets.tickets.length;
      this.tickets.tickets.push(ticket);

      // Update indexes
      if (ticket.channelId) {
        this.ticketByChannel.set(ticket.channelId, idx);
      }
      const userTickets = this.ticketByUser.get(data.userId) || [];
      userTickets.push(idx);
      this.ticketByUser.set(data.userId, userTickets);

      this.saveTicketsToFile();
      return { ...ticket };
    } finally {
      this.releaseTicketLock();
    }
  }

  updateTicket(ticketId: number, updates: TicketUpdate): Ticket | null {
    const idx = this.tickets.tickets.findIndex(t => t.id === ticketId);
    if (idx === -1) return null;

    const ticket = this.tickets.tickets[idx];
    const oldChannelId = ticket.channelId;

    if (updates.channelId !== undefined) {
      ticket.channelId = updates.channelId;
    }
    if (updates.status !== undefined) {
      ticket.status = updates.status;
    }
    if (updates.claimedBy !== undefined) {
      ticket.claimedBy = updates.claimedBy;
    }
    if (updates.claimedAt !== undefined) {
      ticket.claimedAt = updates.claimedAt;
    }
    if (updates.rating !== undefined) {
      ticket.rating = updates.rating;
    }
    if (updates.closedBy !== undefined) {
      ticket.closedBy = updates.closedBy;
    }
    if (updates.closeReason !== undefined) {
      ticket.closeReason = updates.closeReason;
    }
    if (updates.closedAt !== undefined) {
      ticket.closedAt = updates.closedAt;
    }

    // Update channel index if changed
    if (oldChannelId !== ticket.channelId) {
      if (oldChannelId) {
        this.ticketByChannel.delete(oldChannelId);
      }
      if (ticket.channelId) {
        this.ticketByChannel.set(ticket.channelId, idx);
      }
    }

    this.saveTicketsToFile();
    return { ...ticket };
  }

  closeTicket(ticketId: number, closedBy: string, reason: string): Ticket | null {
    const ticket = this.updateTicket(ticketId, {
      status: 'closed',
      closedBy,
      closeReason: reason,
      closedAt: this.nowISO()
    });

    if (ticket) {
      this.rebuildIndexes();
    }

    return ticket;
  }

  claimTicket(ticketId: number, userId: string): Ticket | null {
    return this.updateTicket(ticketId, {
      claimedBy: userId,
      claimedAt: this.nowISO()
    });
  }

  setTicketRating(ticketId: number, rating: number): Ticket | null {
    return this.updateTicket(ticketId, { rating });
  }

  removeTicket(ticketId: number): boolean {
    const initialLen = this.tickets.tickets.length;
    this.tickets.tickets = this.tickets.tickets.filter(t => t.id !== ticketId);

    if (this.tickets.tickets.length < initialLen) {
      this.rebuildIndexes();
      this.saveTicketsToFile();
      return true;
    }
    return false;
  }

  removeInvalidTickets(validChannelIds: string[]): number {
    const initialLen = this.tickets.tickets.length;
    const validSet = new Set(validChannelIds);

    this.tickets.tickets = this.tickets.tickets.filter(t => {
      if (t.status !== 'open') return true;
      if (!t.channelId) return false;
      return validSet.has(t.channelId);
    });

    const removed = initialLen - this.tickets.tickets.length;
    if (removed > 0) {
      this.rebuildIndexes();
      this.saveTicketsToFile();
    }

    return removed;
  }

  resetTickets(): void {
    this.tickets = { tickets: [], counter: 0 };
    this.rebuildIndexes();
    this.saveTicketsToFile();
  }

  resetCategories(): void {
    this.config.categories = {
      cheaters: '',
      staffComplaints: '',
      playerComplaints: '',
      gameQuestions: '',
      techSupport: '',
      applications: ''
    };
    this.saveConfigToFile();
  }

  getSnippet(name: string, lang: string): string | null {
    const snippet = this.snippets.snippets[name];
    if (!snippet) return null;

    return snippet[lang as 'ru' | 'en'] || snippet.ru || snippet.en || null;
  }

  getSnippetNames(): string[] {
    return Object.keys(this.snippets.snippets);
  }

  private saveFeedbackToFile(): boolean {
    try {
      const filePath = path.join(this.dataPath, 'feedback.json');
      fs.writeFileSync(filePath, JSON.stringify(this.feedbackStore, null, 2));
      return true;
    } catch (error) {
      logger.error('Error saving feedback', error as Error);
      return false;
    }
  }

  private loadFeedbackStore(): void {
    const feedbackPath = path.join(this.dataPath, 'feedback.json');
    if (fs.existsSync(feedbackPath)) {
      try {
        const data = fs.readFileSync(feedbackPath, 'utf-8');
        this.feedbackStore = JSON.parse(data);
      } catch {
        this.feedbackStore = { feedback: [], counter: 0 };
        this.saveFeedbackToFile();
      }
    } else {
      this.feedbackStore = { feedback: [], counter: 0 };
      this.saveFeedbackToFile();
    }
  }

  createFeedback(data: Omit<Feedback, 'id' | 'createdAt'>): Feedback {
    this.feedbackStore.counter += 1;

    const feedback: Feedback = {
      id: this.feedbackStore.counter,
      ...data,
      createdAt: new Date().toISOString()
    };

    this.feedbackStore.feedback.push(feedback);
    this.saveFeedbackToFile();
    return feedback;
  }

  getFeedbackByModerator(moderatorId: string): Feedback[] {
    return this.feedbackStore.feedback.filter(f => f.moderatorId === moderatorId);
  }

  getModeratorStats(moderatorId: string): { positive: number; negative: number } {
    const feedback = this.getFeedbackByModerator(moderatorId);
    return {
      positive: feedback.filter(f => f.rating === 'positive').length,
      negative: feedback.filter(f => f.rating === 'negative').length
    };
  }
}

const dataManager = new DataManager();

export function initDataManager(dataPath: string): void {
  dataManager.init(dataPath);
}

export function getConfig(): Config {
  return dataManager.getConfig();
}

export function saveConfig(config: Config): boolean {
  return dataManager.saveConfig(config);
}

export function getRole(roleKey: string): string | null {
  return dataManager.getRole(roleKey);
}

export function setRole(roleKey: string, roleId: string): boolean {
  return dataManager.setRole(roleKey, roleId);
}

export function getCategory(categoryKey: string): string | null {
  return dataManager.getCategory(categoryKey);
}

export function setCategory(categoryKey: string, categoryId: string): boolean {
  return dataManager.setCategory(categoryKey, categoryId);
}

export function getChannel(channelKey: string): string | null {
  return dataManager.getChannel(channelKey);
}

export function setChannel(channelKey: string, channelId: string): boolean {
  return dataManager.setChannel(channelKey, channelId);
}

export function getSetting(settingKey: string): number | null {
  return dataManager.getSetting(settingKey);
}

export function getTickets(): Ticket[] {
  return dataManager.getTickets();
}

export function getTicketById(ticketId: number): Ticket | null {
  return dataManager.getTicketById(ticketId);
}

export function getTicketByChannelId(channelId: string): Ticket | null {
  return dataManager.getTicketByChannelId(channelId);
}

export function getUserTickets(userId: string): Ticket[] {
  return dataManager.getUserTickets(userId);
}

export async function createTicket(data: TicketCreateData): Promise<Ticket> {
  return dataManager.createTicket(data);
}

export function updateTicket(ticketId: number, updates: TicketUpdate): Ticket | null {
  return dataManager.updateTicket(ticketId, updates);
}

export function closeTicket(ticketId: number, closedBy: string, reason: string): Ticket | null {
  return dataManager.closeTicket(ticketId, closedBy, reason);
}

export function claimTicket(ticketId: number, userId: string): Ticket | null {
  return dataManager.claimTicket(ticketId, userId);
}

export function setTicketRating(ticketId: number, rating: number): Ticket | null {
  return dataManager.setTicketRating(ticketId, rating);
}

export function removeTicket(ticketId: number): boolean {
  return dataManager.removeTicket(ticketId);
}

export function removeInvalidTickets(validChannelIds: string[]): number {
  return dataManager.removeInvalidTickets(validChannelIds);
}

export function getSnippet(name: string, lang: string): string | null {
  return dataManager.getSnippet(name, lang);
}

export function getSnippetNames(): string[] {
  return dataManager.getSnippetNames();
}

export function resetTickets(): void {
  return dataManager.resetTickets();
}

export function resetCategories(): void {
  return dataManager.resetCategories();
}

export function createFeedback(data: Omit<Feedback, 'id' | 'createdAt'>): Feedback {
  return dataManager.createFeedback(data);
}

export function getFeedbackByModerator(moderatorId: string): Feedback[] {
  return dataManager.getFeedbackByModerator(moderatorId);
}

export function getModeratorStats(moderatorId: string): { positive: number; negative: number } {
  return dataManager.getModeratorStats(moderatorId);
}

export default dataManager;
