import { Locale } from '../types';

const ru: Locale = {
  language: 'Русский',
  languageCode: 'ru',

  panel: {
    title: 'Система тикетов',
    description: 'Выберите язык для создания тикета.\nПосле выбора языка вам будет предложено выбрать категорию обращения.',
    selectLanguage: 'Выберите язык',
    selectCategory: 'Выберите категорию обращения',
    footer: 'Unturned Server'
  },

  categories: {
    cheater_report: {
      name: 'Жалоба на читера',
      description: 'Сообщить о игроке, использующем читы'
    },
    staff_complaint: {
      name: 'Жалоба на состав',
      description: 'Жалоба на действия модератора/администратора'
    },
    player_complaint: {
      name: 'Жалоба на игрока',
      description: 'Жалоба на нарушение правил игроком'
    },
    unban_request: {
      name: 'Заявка на разбан',
      description: 'Подать апелляцию на снятие бана'
    },
    game_question: {
      name: 'Игровой вопрос',
      description: 'Вопросы по игровому процессу'
    },
    tech_support: {
      name: 'Тех. поддержка',
      description: 'Технические проблемы с сервером'
    },
    moderator_application: {
      name: 'Заявка на модератора',
      description: 'Подать заявку на должность модератора'
    },
  },

  modals: {
    cheater_report: {
      title: 'Жалоба на читера',
      fields: {
        suspect_name: { label: 'Никнейм подозреваемого', placeholder: 'Введите никнейм игрока' },
        suspect_steam: { label: 'Steam ID подозреваемого', placeholder: 'Например: 76561198xxxxxxxxx' },
        cheat_type: { label: 'Тип чита', placeholder: 'Аимбот, ESP, спидхак и т.д.' },
        evidence: { label: 'Доказательства', placeholder: 'Ссылки на скриншоты/видео' },
        additional_info: { label: 'Дополнительная информация', placeholder: 'Время, сервер, другие детали (необязательно)' }
      }
    },
    staff_complaint: {
      title: 'Жалоба на состав',
      fields: {
        staff_name: { label: 'Никнейм сотрудника', placeholder: 'На кого жалуетесь' },
        complaint_reason: { label: 'Причина жалобы', placeholder: 'Опишите ситуацию подробно' },
        evidence: { label: 'Доказательства', placeholder: 'Ссылки на скриншоты/видео' },
        incident_time: { label: 'Время инцидента', placeholder: 'Дата и время (необязательно)' }
      }
    },
    player_complaint: {
      title: 'Жалоба на игрока',
      fields: {
        player_name: { label: 'Никнейм игрока', placeholder: 'На кого жалуетесь' },
        complaint_reason: { label: 'Причина жалобы', placeholder: 'Опишите нарушение' },
        evidence: { label: 'Доказательства', placeholder: 'Ссылки на скриншоты/видео (необязательно)' },
        incident_time: { label: 'Время инцидента', placeholder: 'Дата и время (необязательно)' }
      }
    },
    unban_request: {
      title: 'Заявка на разбан',
      fields: {
        steam_id: { label: 'Ваш Steam ID', placeholder: 'Например: 76561198xxxxxxxxx' },
        ban_reason: { label: 'Причина бана', placeholder: 'За что вас забанили' },
        unban_reason: { label: 'Почему должны разбанить', placeholder: 'Аргументируйте' }
      }
    },
    game_question: {
      title: 'Игровой вопрос',
      fields: {
        question_topic: { label: 'Тема вопроса', placeholder: 'Кратко опишите тему' },
        question_details: { label: 'Подробности', placeholder: 'Опишите ваш вопрос детально' }
      }
    },
    tech_support: {
      title: 'Техническая поддержка',
      fields: {
        issue_type: { label: 'Тип проблемы', placeholder: 'Лаги, вылеты, баги и т.д.' },
        issue_description: { label: 'Описание проблемы', placeholder: 'Опишите проблему подробно' },
        steps_tried: { label: 'Что пробовали', placeholder: 'Какие шаги уже предприняли (необязательно)' }
      }
    },
    moderator_application: {
      title: 'Заявка на модератора',
      fields: {
        age: { label: 'Ваш возраст', placeholder: 'Полных лет' },
        experience: { label: 'Опыт модерирования', placeholder: 'Где и сколько модерировали' },
        why_join: { label: 'Почему хотите в команду', placeholder: 'Мотивация' },
        availability: { label: 'Доступность', placeholder: 'Сколько часов в день/неделю' }
      }
    },
    close: {
      title: 'Закрытие тикета',
      reason: { label: 'Причина закрытия', placeholder: 'Укажите причину закрытия тикета' }
    }
  },

  ticket: {
    created: {
      title: 'Тикет создан',
      description: 'Добро пожаловать в ваш тикет.\nОператор ответит вам в ближайшее время.',
      fields: {
        category: 'Категория',
        author: 'Автор',
        created: 'Создан'
      }
    },
    buttons: {
      close: 'Закрыть',
      claim: 'Взять',
      claimed: 'Взят',
      transcript: 'Транскрипт',
      callSenior: 'Позвать старшего'
    },
    claimed: {
      title: 'Тикет взят',
      description: 'Тикет взят модератором {user}'
    },
    closing: {
      title: 'Тикет закрывается',
      description: 'Этот тикет будет удалён через {seconds} секунд.',
      reason: 'Причина: {reason}'
    },
    closed: {
      title: 'Тикет закрыт',
      description: 'Ваш тикет #{id} был закрыт.\nТранскрипт прикреплён к сообщению.'
    },
    rating: {
      title: 'Оцените поддержку',
      description: 'Пожалуйста, оцените качество обслуживания:'
    },
    ratingReceived: {
      title: 'Спасибо за оценку',
      description: 'Вы поставили оценку: {rating}'
    },
    limitReached: {
      title: 'Лимит тикетов',
      description: 'У вас уже есть {count} открытых тикетов. Максимум: {max}.'
    },
    notInTicket: 'Эта команда может быть использована только в канале тикета.',
    userAdded: 'Пользователь {user} добавлен в тикет.',
    userRemoved: 'Пользователь {user} удалён из тикета.',
    renamed: 'Тикет переименован в: {name}',
    pingStaff: 'Требуется помощь старшего модератора',
    seniorCalled: 'Старший модератор вызван'
  },

  logs: {
    ticketCreated: {
      title: 'Тикет создан',
      fields: {
        ticketId: 'ID тикета',
        user: 'Пользователь',
        category: 'Категория',
        channel: 'Канал'
      }
    },
    ticketClosed: {
      title: 'Тикет закрыт',
      fields: {
        ticketId: 'ID тикета',
        user: 'Пользователь',
        closedBy: 'Закрыл',
        reason: 'Причина',
        duration: 'Длительность',
        rating: 'Оценка'
      }
    }
  },

  commands: {
    setup: {
      success: 'Панель тикетов успешно создана',
      categoriesCreated: 'Создано категорий: {count}',
      noPermission: 'У вас нет прав для использования этой команды.'
    },
    add: {
      description: 'Добавить пользователя в тикет',
      userOption: 'Пользователь для добавления'
    },
    remove: {
      description: 'Удалить пользователя из тикета',
      userOption: 'Пользователь для удаления'
    },
    close: {
      description: 'Закрыть тикет',
      reasonOption: 'Причина закрытия'
    },
    rename: {
      description: 'Переименовать канал тикета',
      nameOption: 'Новое название'
    },
    tag: {
      description: 'Отправить готовый ответ',
      tagOption: 'Название тега',
      notFound: 'Тег "{tag}" не найден.',
      list: 'Доступные теги: {tags}'
    }
  },

  errors: {
    generic: 'Произошла ошибка. Пожалуйста, попробуйте позже.',
    noPermission: 'У вас нет прав для выполнения этого действия.',
    ticketNotFound: 'Тикет не найден.',
    userNotFound: 'Пользователь не найден.',
    cannotDM: 'Не удалось отправить сообщение в личные сообщения.',
    categoryNotFound: 'Категория не найдена. Запустите /setup.'
  }
};

export default ru;
