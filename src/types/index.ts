import {
  Client,
  Collection,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  TextChannel,
  AttachmentBuilder
} from 'discord.js';

export interface RolesConfig {
  admin: string;
  seniorModerator: string;
  moderator: string;
  helper: string;
  builder: string;
  eventManager: string;
}

export interface CategoriesConfig {
  cheaters: string;
  staffComplaints: string;
  playerComplaints: string;
  gameQuestions: string;
  techSupport: string;
  applications: string;
}

export interface ChannelsConfig {
  ticketLogs: string;
  ticketPanel: string;
  feedbackLogs: string;
}

export interface SettingsConfig {
  maxTicketsPerUser: number;
  ticketDeleteDelay: number;
  pingDeleteDelay: number;
}

export interface Config {
  roles: RolesConfig;
  categories: CategoriesConfig;
  channels: ChannelsConfig;
  settings: SettingsConfig;
}

export type TicketStatus = 'open' | 'closed';

export interface FormData {
  [key: string]: string | null;
}

export interface Ticket {
  id: number;
  type: string;
  userId: string;
  guildId: string;
  channelId: string | null;
  language: string;
  server?: string;
  formData: FormData | null;
  status: TicketStatus;
  claimedBy: string | null;
  claimedAt: string | null;
  rating: number | null;
  createdAt: string;
  closedBy?: string;
  closeReason?: string;
  closedAt?: string;
}

export interface TicketData {
  type: string;
  userId: string;
  guildId: string;
  channelId: string | null;
  language: string;
  formData: FormData | null;
}

export interface TicketsStore {
  tickets: Ticket[];
  counter: number;
}

export type ModalFieldStyle = 'SHORT' | 'PARAGRAPH';

export interface ModalField {
  id: string;
  required: boolean;
  style: ModalFieldStyle;
  maxLength: number;
}

export type RoleKey = keyof RolesConfig;
export type CategoryKey = keyof CategoriesConfig;

export interface TicketTypeConfig {
  id: string;
  emoji: string;
  color: number;
  categoryKey: CategoryKey;
  pingRoles: RoleKey[];
  accessRoles: RoleKey[];
  keywords?: string[];
  modalFields: ModalField[];
}

export interface CategoryTypeInfo {
  name: string;
  position: number;
}

export interface CategoryTypes {
  cheaters: CategoryTypeInfo;
  staffComplaints: CategoryTypeInfo;
  playerComplaints: CategoryTypeInfo;
  gameQuestions: CategoryTypeInfo;
  techSupport: CategoryTypeInfo;
  applications: CategoryTypeInfo;
}

export interface SnippetTranslations {
  ru: string;
  en: string;
}

export interface Snippets {
  [name: string]: SnippetTranslations;
}

export interface SnippetsStore {
  snippets: Snippets;
}

export interface LocaleCategory {
  name: string;
  description: string;
}

export interface LocaleModalField {
  label: string;
  placeholder: string;
}

export interface LocaleModal {
  title: string;
  fields: {
    [key: string]: LocaleModalField;
  };
}

export interface LocaleCloseModal {
  title: string;
  reason: LocaleModalField;
}

export interface Locale {
  language: string;
  languageCode: string;
  panel: {
    title: string;
    description: string;
    selectLanguage: string;
    selectCategory: string;
    footer: string;
  };
  categories: {
    [key: string]: LocaleCategory;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modals: any;
  ticket: {
    created: {
      title: string;
      description: string;
      fields: {
        category: string;
        author: string;
        created: string;
      };
    };
    buttons: {
      close: string;
      claim: string;
      claimed: string;
      transcript: string;
      callSenior: string;
    };
    claimed: {
      title: string;
      description: string;
    };
    closing: {
      title: string;
      description: string;
      reason: string;
    };
    closed: {
      title: string;
      description: string;
    };
    rating: {
      title: string;
      description: string;
    };
    ratingReceived: {
      title: string;
      description: string;
    };
    limitReached: {
      title: string;
      description: string;
    };
    notInTicket: string;
    userAdded: string;
    userRemoved: string;
    renamed: string;
    pingStaff: string;
    seniorCalled: string;
  };
  logs: {
    ticketCreated: {
      title: string;
      fields: {
        ticketId: string;
        user: string;
        category: string;
        channel: string;
      };
    };
    ticketClosed: {
      title: string;
      fields: {
        ticketId: string;
        user: string;
        closedBy: string;
        reason: string;
        duration: string;
        rating: string;
      };
    };
  };
  commands: {
    setup: {
      success: string;
      categoriesCreated: string;
      noPermission: string;
    };
    add: {
      description: string;
      userOption: string;
    };
    remove: {
      description: string;
      userOption: string;
    };
    close: {
      description: string;
      reasonOption: string;
    };
    rename: {
      description: string;
      nameOption: string;
    };
    tag: {
      description: string;
      tagOption: string;
      notFound: string;
      list: string;
    };
  };
  errors: {
    generic: string;
    noPermission: string;
    ticketNotFound: string;
    userNotFound: string;
    cannotDM: string;
    categoryNotFound: string;
  };
}

export interface Command {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface Event {
  name: string;
  once?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (...args: any[]) => Promise<void>;
}

export interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
}

export interface TicketCreateResult {
  success: boolean;
  error?: string;
  embed?: EmbedBuilder;
  channel?: TextChannel;
  ticket?: Ticket;
}

export interface TicketCloseResult {
  success: boolean;
  error?: string;
  ticket?: Ticket;
}

export interface TicketClaimResult {
  success: boolean;
  error?: string;
}

export interface TicketActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface TranscriptResult {
  success: boolean;
  transcript?: AttachmentBuilder;
}

export interface TranscriptMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot: boolean;
  };
  timestamp: string;
  attachments: TranscriptAttachment[];
  embeds: TranscriptEmbed[];
  reactions: TranscriptReaction[];
}

export interface TranscriptAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  contentType: string | null;
}

export interface TranscriptEmbed {
  title: string | null;
  description: string | null;
  color: number | null;
  fields: TranscriptEmbedField[];
  footer: string | null;
  timestamp: string | null;
}

export interface TranscriptEmbedField {
  name: string;
  value: string;
  inline: boolean;
}

export interface TranscriptReaction {
  emoji: string;
  count: number;
}

export interface TranscriptOptions {
  filename?: string;
  footerText?: string;
  headerText?: string;
}

export interface Feedback {
  id: number;
  ticketId: number;
  moderatorId: string;
  moderatorName: string;
  userId: string;
  userName: string;
  rating: 'positive' | 'negative';
  comment: string;
  createdAt: string;
}

export interface FeedbackStore {
  feedback: Feedback[];
  counter: number;
}

export type LanguageCode = 'ru' | 'en';

export interface EmbedColors {
  primary: number;
  success: number;
  warning: number;
  danger: number;
  info: number;
}
