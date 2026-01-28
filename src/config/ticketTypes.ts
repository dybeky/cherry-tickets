import { TicketTypeConfig, CategoryTypes, CategoryKey } from '../types';

export const ticketTypes: TicketTypeConfig[] = [
  {
    id: 'cheater_report',
    emoji: '',
    color: 0xFF0000,
    categoryKey: 'cheaters',
    pingRoles: ['moderator', 'seniorModerator'],
    accessRoles: ['moderator', 'seniorModerator', 'admin'],
    modalFields: [
      { id: 'suspect_name', required: true, style: 'SHORT', maxLength: 100 },
      { id: 'suspect_steam', required: true, style: 'SHORT', maxLength: 50 },
      { id: 'cheat_type', required: true, style: 'SHORT', maxLength: 100 },
      { id: 'evidence', required: true, style: 'PARAGRAPH', maxLength: 1000 },
      { id: 'additional_info', required: false, style: 'PARAGRAPH', maxLength: 500 }
    ]
  },
  {
    id: 'staff_complaint',
    emoji: '',
    color: 0xFFA500,
    categoryKey: 'staffComplaints',
    pingRoles: ['seniorModerator', 'admin'],
    accessRoles: ['seniorModerator', 'admin'],
    modalFields: [
      { id: 'staff_name', required: true, style: 'SHORT', maxLength: 100 },
      { id: 'complaint_reason', required: true, style: 'PARAGRAPH', maxLength: 1000 },
      { id: 'evidence', required: true, style: 'PARAGRAPH', maxLength: 1000 },
      { id: 'incident_time', required: false, style: 'SHORT', maxLength: 100 }
    ]
  },
  {
    id: 'player_complaint',
    emoji: '',
    color: 0xFFFF00,
    categoryKey: 'playerComplaints',
    pingRoles: ['helper', 'moderator'],
    accessRoles: ['helper', 'moderator', 'seniorModerator', 'admin'],
    modalFields: [
      { id: 'player_name', required: true, style: 'SHORT', maxLength: 100 },
      { id: 'complaint_reason', required: true, style: 'PARAGRAPH', maxLength: 1000 },
      { id: 'evidence', required: false, style: 'PARAGRAPH', maxLength: 1000 },
      { id: 'incident_time', required: false, style: 'SHORT', maxLength: 100 }
    ]
  },
  {
    id: 'unban_request',
    emoji: '',
    color: 0x00FF00,
    categoryKey: 'gameQuestions',
    pingRoles: ['moderator', 'seniorModerator'],
    accessRoles: ['moderator', 'seniorModerator', 'admin'],
    modalFields: [
      { id: 'steam_id', required: true, style: 'SHORT', maxLength: 50 },
      { id: 'ban_reason', required: true, style: 'SHORT', maxLength: 200 },
      { id: 'unban_reason', required: true, style: 'PARAGRAPH', maxLength: 1000 }
    ]
  },
  {
    id: 'game_question',
    emoji: '',
    color: 0x00BFFF,
    categoryKey: 'gameQuestions',
    pingRoles: ['helper'],
    accessRoles: ['helper', 'moderator', 'seniorModerator', 'admin'],
    modalFields: [
      { id: 'question_topic', required: true, style: 'SHORT', maxLength: 100 },
      { id: 'question_details', required: true, style: 'PARAGRAPH', maxLength: 1000 }
    ]
  },
  {
    id: 'tech_support',
    emoji: '',
    color: 0x808080,
    categoryKey: 'techSupport',
    pingRoles: ['helper', 'moderator'],
    accessRoles: ['helper', 'moderator', 'seniorModerator', 'admin'],
    modalFields: [
      { id: 'issue_type', required: true, style: 'SHORT', maxLength: 100 },
      { id: 'issue_description', required: true, style: 'PARAGRAPH', maxLength: 1000 },
      { id: 'steps_tried', required: false, style: 'PARAGRAPH', maxLength: 500 }
    ]
  },
  {
    id: 'moderator_application',
    emoji: '',
    color: 0x9B59B6,
    categoryKey: 'applications',
    pingRoles: ['seniorModerator', 'admin'],
    accessRoles: ['seniorModerator', 'admin'],
    modalFields: [
      { id: 'age', required: true, style: 'SHORT', maxLength: 10 },
      { id: 'experience', required: true, style: 'PARAGRAPH', maxLength: 1000 },
      { id: 'why_join', required: true, style: 'PARAGRAPH', maxLength: 1000 },
      { id: 'availability', required: true, style: 'SHORT', maxLength: 200 }
    ]
  },
];

export function getTicketType(id: string): TicketTypeConfig | undefined {
  return ticketTypes.find(t => t.id === id);
}

export function getCategoryTypes(): CategoryTypes {
  return {
    cheaters: { name: 'Cheaters', position: 1 },
    staffComplaints: { name: 'Staff Complaints', position: 2 },
    playerComplaints: { name: 'Complaints', position: 3 },
    gameQuestions: { name: 'Game Questions', position: 4 },
    techSupport: { name: 'Tech Support', position: 5 },
    applications: { name: 'Applications', position: 6 }
  };
}
