import db from '@/db/db.js';

const repo = {
  navbar: {
    link_schools: {
      'en': 'Schools',
      'fi': 'Koulut',
    },
    link_teachers: {
      'en': 'Teachers',
      'fi': 'Opettajat',
    },
    link_students: {
      'en': 'Students',
      'fi': 'Opiskelijat',
    },
    link_instructions: {
      'en': 'Instructions',
      'fi': 'Ohjat',
    },
    link_classes: {
      'en': 'Classes',
      'fi': 'Ryhmät',
    },
    link_results: {
      'en': 'Results',
      'fi': 'Results',
    },
    link_assignments: {
      'en': 'Assignments',
      'fi': 'Tehtävät',
    },

    user_logout: {
      'en': 'Log out',
      'fi': 'Kirjaudu ulos',
    },
  },

  assignments: {
    message_removed_account: {
      'en': 'This student account was removed from all schools and is considered as frozen. No tasks will be assigned to this account in future.',
      'fi': 'Poistettu+',
    },
    message_failed_assignments: {
      'en': 'Failed to load assignments',
      'fi': 'Failed to load assignments',
    },
    message_failed_sessions: {
      'en': 'Failed to load sessions',
      'fi': 'Failed to load sessions',
    },
    
    assignments_title: {
      'en': 'Tasks waiting to be completed',
      'fi': 'Tehtävät',
    },
    assignments_0: {
      'en': 'No assigned tasks yet',
      'fi': 'Ei tehtäviä',
    },
    assignments_start: {
      'en': 'Start',
      'fi': 'Aloita',
    },

    completed_title: {
      'en': 'Completed tasks',
      'fi': 'Valmiit tehtävät',
    },
    completed_0: {
      'en': 'No completed tasks yet',
      'fi': 'Ei tehtäviä',
    },
    completed_col_class: {
      'en': 'Class',
      'fi': 'Ryhmä',
    },
    completed_col_task: {
      'en': 'Task',
      'fi': 'Tehtävä',
    },
    completed_col_wpm: {
      'en': 'WPM',
      'fi': 'Sanat/Min',
    },
    completed_col_date: {
      'en': 'Date',
      'fi': 'Aika',
    },
  },

  home: {
    subtitle: {
      'en': 'A reading aid for students and teachers',
      'fi': 'A reading aid for students and teachers',
    },
    request_account: {
      'en': 'Request an account',
      'fi': 'Request an account',
    },
    forgot_password: {
      'en': 'Forgot password?',
      'fi': 'Unohtanutko salasanasi?',
    },

    acc_admin: {
      'en': 'an admin',
      'fi': 'Admin',
    },
    acc_school: {
      'en': 'a school',
      'fi': 'Koulu',
    },
    acc_teacher: {
      'en': 'a teacher',
      'fi': 'Opettaja',
    },
    acc_student: {
      'en': 'a student',
      'fi': 'Opiskelija',
    },

    info_title: {
      'en': p1 => `As ${p1}, you can`,
      'fi': p1 => `${p1} saa`,
    },
    info_adm_1: {
      'en': 'Add and list teachers',
      'fi': 'Add and list teachers',
    },
    info_adm_2: {
      'en': 'Move teachers to other school',
      'fi': 'Move teachers to other school',
    },
    info_adm_3: {
      'en': 'Add and list students',
      'fi': 'Add and list students',
    },
    info_adm_4: {
      'en': 'Move students to other school',
      'fi': 'Move students to other school',
    },
    info_tch_1: {
      'en': 'Add, list, edit and remove instructions',
      'fi': 'Add, list, edit and remove instructions',
    },
    info_tch_2: {
      'en': 'Add, list, edit and remove classes',
      'fi': 'Add, list, edit and remove classes',
    },
    info_tch_3: {
      'en': 'Add, list, edit and remove tasks',
      'fi': 'Add, list, edit and remove tasks',
    },
    info_tch_4: {
      'en': 'Add students to classes, list them and remove',
      'fi': 'Add students to classes, list them and remove',
    },
    info_tch_5: {
      'en': 'Assign tasks to students',
      'fi': 'Assign tasks to students',
    },
    info_tch_6: {
      'en': 'Create visalizations from data of tasks completed by students',
      'fi': 'Create visalizations from data of tasks completed by students',
    },
    info_std_1: {
      'en': 'List tasks assigned to complete',
      'fi': 'List tasks assigned to complete',
    },
    info_std_2: {
      'en': 'Complete assignments',
      'fi': 'Complete assignments',
    },
    info_std_3: {
      'en': 'List completed assignments',
      'fi': 'List completed assignments',
    },

    manual: {
      'en': 'Manual',
      'fi': 'Ohjeet',
    },
    test_info: {
      'en': 'Tested with',
      'fi': 'Tested with',
    },
    contact_info: {
      'en': 'School rectors and teachers, please contact us directly.',
      'fi': 'School rectors and teachers, please contact us directly.',
    },
    contact_uta: {
      'en': 'University of Tampere',
      'fi': 'Tampereen Yliopisto',
    },

    message_password_reset: {
      'en': 'Send password reset notification to this email:',
      'fi': 'Send password reset notification to this email:',
    },
    button_password_reset: {
      'en': 'Send',
      'fi': 'Send',
    },

    ws_err_title: {
      'en': 'Communication with gaze tracker is blocked by the browser',
      'fi': 'Communication with gaze tracker is blocked by the browser',
    },
    ws_err_subtitle: {
      'en': 'Please enable the communication and reload the page',
      'fi': 'Please enable the communication and reload the page',
    },
    ws_unblock_1: {
      'en': ['Navigate to', 'page. Agree to be careful if the browsers asks you to be so.'], 
      'fi': ['Navigate to', 'page. Agree to be careful if the browsers asks you to be so.'], 
    },
    ws_unblock_2: {
      'en': ['Type', 'in the search box.'], 
      'fi': ['Type', 'in the search box.'], 
    },
    ws_unblock_3: {
      'en': ['If the value of this parameter is', ', then double-click on it to change it to', '.'], 
      'fi': ['If the value of this parameter is', ', then double-click on it to change it to', '.'], 
    },
    ws_unblock_4: {
      'en': '(search "how to enable websocket over https" for you browser)', 
      'fi': '(search "how to enable websocket over https" for you browser)', 
    },
  }
};

export let langs = [ 'en', 'fi' ];

/**
 * @param {string} compName 
 * @returns {Object.<string>}
 */
export function i10n( compName ) {
  const compRepo = repo[ compName ];
  if (!compRepo) {
    return null;
  }

  let lang = db.user ? db.user.prefs.lang : 'en';

  lang = lang.toLowerCase();
  if (langs.indexOf( lang ) < 0) {
    lang = langs[0];
  }

  /** @type {Object.<string>} */
  const result = {};
  for (let token in compRepo) {
    result[ token ] = compRepo[ token ][ lang ];
  }

  return result;
}