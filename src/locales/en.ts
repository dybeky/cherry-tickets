import { Locale } from '../types';

const en: Locale = {
  language: 'English',
  languageCode: 'en',

  panel: {
    title: 'Ticket System',
    description: 'Select a language to create a ticket.\nAfter selecting a language, you will be prompted to choose a category.',
    selectLanguage: 'Select language',
    selectCategory: 'Select ticket category',
    footer: 'Unturned Server'
  },

  categories: {
    cheater_report: {
      name: 'Cheater Report',
      description: 'Report a player using cheats'
    },
    staff_complaint: {
      name: 'Staff Complaint',
      description: 'Complaint about moderator/admin actions'
    },
    player_complaint: {
      name: 'Player Complaint',
      description: 'Report a player rule violation'
    },
    unban_request: {
      name: 'Unban Request',
      description: 'Submit a ban appeal'
    },
    game_question: {
      name: 'Game Question',
      description: 'Questions about gameplay'
    },
    tech_support: {
      name: 'Tech Support',
      description: 'Technical issues with the server'
    },
    moderator_application: {
      name: 'Moderator Application',
      description: 'Apply for moderator position'
    },
  },

  modals: {
    cheater_report: {
      title: 'Cheater Report',
      fields: {
        suspect_name: { label: 'Suspect\'s nickname', placeholder: 'Enter player nickname' },
        suspect_steam: { label: 'Suspect\'s Steam ID', placeholder: 'Example: 76561198xxxxxxxxx' },
        cheat_type: { label: 'Cheat type', placeholder: 'Aimbot, ESP, speedhack, etc.' },
        evidence: { label: 'Evidence', placeholder: 'Links to screenshots/videos' },
        additional_info: { label: 'Additional information', placeholder: 'Time, server, other details (optional)' }
      }
    },
    staff_complaint: {
      title: 'Staff Complaint',
      fields: {
        staff_name: { label: 'Staff member\'s nickname', placeholder: 'Who are you complaining about' },
        complaint_reason: { label: 'Reason for complaint', placeholder: 'Describe the situation in detail' },
        evidence: { label: 'Evidence', placeholder: 'Links to screenshots/videos' },
        incident_time: { label: 'Time of incident', placeholder: 'Date and time (optional)' }
      }
    },
    player_complaint: {
      title: 'Player Complaint',
      fields: {
        player_name: { label: 'Player\'s nickname', placeholder: 'Who are you complaining about' },
        complaint_reason: { label: 'Reason for complaint', placeholder: 'Describe the violation' },
        evidence: { label: 'Evidence', placeholder: 'Links to screenshots/videos (optional)' },
        incident_time: { label: 'Time of incident', placeholder: 'Date and time (optional)' }
      }
    },
    unban_request: {
      title: 'Unban Request',
      fields: {
        steam_id: { label: 'Your Steam ID', placeholder: 'Example: 76561198xxxxxxxxx' },
        ban_reason: { label: 'Ban reason', placeholder: 'Why were you banned' },
        unban_reason: { label: 'Why should you be unbanned', placeholder: 'Make your case' }
      }
    },
    game_question: {
      title: 'Game Question',
      fields: {
        question_topic: { label: 'Question topic', placeholder: 'Briefly describe the topic' },
        question_details: { label: 'Details', placeholder: 'Describe your question in detail' }
      }
    },
    tech_support: {
      title: 'Technical Support',
      fields: {
        issue_type: { label: 'Issue type', placeholder: 'Lag, crashes, bugs, etc.' },
        issue_description: { label: 'Issue description', placeholder: 'Describe the problem in detail' },
        steps_tried: { label: 'Steps tried', placeholder: 'What have you already tried (optional)' }
      }
    },
    moderator_application: {
      title: 'Moderator Application',
      fields: {
        age: { label: 'Your age', placeholder: 'Years old' },
        experience: { label: 'Moderation experience', placeholder: 'Where and how long have you moderated' },
        why_join: { label: 'Why do you want to join', placeholder: 'Motivation' },
        availability: { label: 'Availability', placeholder: 'Hours per day/week' }
      }
    },
    close: {
      title: 'Close Ticket',
      reason: { label: 'Close reason', placeholder: 'Specify the reason for closing' }
    }
  },

  ticket: {
    created: {
      title: 'Ticket Created',
      description: 'Welcome to your ticket.\nA staff member will respond shortly.',
      fields: {
        category: 'Category',
        author: 'Author',
        created: 'Created'
      }
    },
    buttons: {
      close: 'Close',
      claim: 'Claim',
      claimed: 'Claimed',
      transcript: 'Transcript',
      callSenior: 'Call Senior'
    },
    claimed: {
      title: 'Ticket Claimed',
      description: 'Ticket claimed by {user}'
    },
    closing: {
      title: 'Ticket Closing',
      description: 'This ticket will be deleted in {seconds} seconds.',
      reason: 'Reason: {reason}'
    },
    closed: {
      title: 'Ticket Closed',
      description: 'Your ticket #{id} has been closed.\nThe transcript is attached to this message.'
    },
    rating: {
      title: 'Rate Support',
      description: 'Please rate the quality of service:'
    },
    ratingReceived: {
      title: 'Thank you for your feedback',
      description: 'You rated: {rating}'
    },
    limitReached: {
      title: 'Ticket Limit',
      description: 'You already have {count} open tickets. Maximum: {max}.'
    },
    notInTicket: 'This command can only be used in a ticket channel.',
    userAdded: 'User {user} has been added to the ticket.',
    userRemoved: 'User {user} has been removed from the ticket.',
    renamed: 'Ticket renamed to: {name}',
    pingStaff: 'Senior moderator assistance needed',
    seniorCalled: 'Senior moderator has been called'
  },

  logs: {
    ticketCreated: {
      title: 'Ticket Created',
      fields: {
        ticketId: 'Ticket ID',
        user: 'User',
        category: 'Category',
        channel: 'Channel'
      }
    },
    ticketClosed: {
      title: 'Ticket Closed',
      fields: {
        ticketId: 'Ticket ID',
        user: 'User',
        closedBy: 'Closed by',
        reason: 'Reason',
        duration: 'Duration',
        rating: 'Rating'
      }
    }
  },

  commands: {
    setup: {
      success: 'Ticket panel created successfully',
      categoriesCreated: 'Categories created: {count}',
      noPermission: 'You do not have permission to use this command.'
    },
    add: {
      description: 'Add a user to the ticket',
      userOption: 'User to add'
    },
    remove: {
      description: 'Remove a user from the ticket',
      userOption: 'User to remove'
    },
    close: {
      description: 'Close the ticket',
      reasonOption: 'Close reason'
    },
    rename: {
      description: 'Rename the ticket channel',
      nameOption: 'New name'
    },
    tag: {
      description: 'Send a pre-made response',
      tagOption: 'Tag name',
      notFound: 'Tag "{tag}" not found.',
      list: 'Available tags: {tags}'
    }
  },

  errors: {
    generic: 'An error occurred. Please try again later.',
    noPermission: 'You do not have permission to perform this action.',
    ticketNotFound: 'Ticket not found.',
    userNotFound: 'User not found.',
    cannotDM: 'Could not send a direct message.',
    categoryNotFound: 'Category not found. Run /setup first.'
  }
};

export default en;
