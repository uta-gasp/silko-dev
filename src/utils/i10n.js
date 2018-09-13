import db from '@/db/db.js';

const repos = {
  db: {
    err_no_resp: {
      'en': 'no response',
      'fi': 'no response',
    },
    err_not_supported: {
      'en': 'not supported',
      'fi': 'not supported',
    },
    err_no_results: {
      'en': 'no results',
      'fi': 'no results',
    },
    err_unknown: {
      'en': 'unknown error',
      'fi': 'unknown error',
    },
  },

  navbar: {
    results: {
      'en': 'Results',
      'fi': 'Results',
    },

    logout: {
      'en': 'Log out',
      'fi': 'Kirjaudu ulos',
    },
  },

  home: {
    hdr_subtitle: {
      'en': 'A reading aid for students and teachers',
      'fi': 'A reading aid for students and teachers',
    },
    hdr_info_title: {
      'en': /** @param {string} p1 */ p1 => `As a ${p1}, you can`,
      'fi': /** @param {string} p1 */ p1 => `${p1} saa`,
    },
    hdr_password_reset: {
      'en': 'Send password reset notification to this email:',
      'fi': 'Send password reset notification to this email:',
    },

    btn_request_account: {
      'en': 'Request an account',
      'fi': 'Request an account',
    },
    btn_forgot_password: {
      'en': 'Forgot password?',
      'fi': 'Unohtanutko salasanasi?',
    },
    btn_send: {
      'en': 'Send',
      'fi': 'Lähetä',
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

    msg_connecting: {
      'en': 'Connecting to database...',
      'fi': 'Connecting to database...',
    },
    msg_test_info: {
      'en': 'Tested with',
      'fi': 'Tested with',
    },
    msg_contact_info: {
      'en': 'School rectors and teachers, please contact us directly.',
      'fi': 'School rectors and teachers, please contact us directly.',
    },
    msg_contact_uta: {
      'en': 'University of Tampere',
      'fi': 'Tampereen Yliopisto',
    },
    msg_request_sent: {
      'en': /** @param {string} p1 */ p1 => `The registration request for "${p1}" has been sent.`,
      'fi': /** @param {string} p1 */ p1 => `The registration request for "${p1}" has been sent.`,
    },
    msg_password_reset: {
      'en': /** @param {string} p1 */ p1 => `The password reset request has been sent to "${p1}".`,
      'fi': /** @param {string} p1 */ p1 => `The password reset request has been sent to "${p1}".`,
    },

    tit_registration: {
      'en': 'Registration',
      'fi': 'Registration',
    },
    tit_pass_reset: {
      'en': 'Password reset',
      'fi': 'Password reset',
    },

    err_password_reset: {
      'en': /** @param {string} p1 */ p1 => `Cannot send the password reset request to "${p1}".`,
      'fi': /** @param {string} p1 */ p1 => `Cannot send the password reset request to "${p1}".`,
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
  },

  assignments: {
    msg_removed_account: {
      'en': 'This student account was removed from all schools and is considered as frozen. No tasks will be assigned to this account in future.',
      'fi': 'Poistettu+',
    },
    msg_no_assignments: {
      'en': 'No assigned tasks yet',
      'fi': 'Ei tehtäviä',
    },
    msg_no_completed: {
      'en': 'No completed tasks yet',
      'fi': 'Ei tehtäviä',
    },

    hdr_assignments: {
      'en': 'Tasks to complete',
      'fi': 'Tehtävät',
    },
    hdr_completed: {
      'en': 'Completed tasks',
      'fi': 'Valmiit tehtävät',
    },
    hdr_wpm: {
      'en': 'WPM',
      'fi': 'Sanat/Min',
    },

    tit_syllab: {
      'en': 'Syllabifications',
      'fi': 'Syllabifications',
    },
    tit_voice: {
      'en': 'Voice',
      'fi': 'Ääni',
    },
    tit_rec: {
      'en': 'Recording',
      'fi': 'Recording',
    },
  },

  assignment: {
    btn_calib: {
      'en': 'Calibrate',
      'fi': 'Calibrate',
    },
    btn_skip_calib: {
      'en': 'Skip calibration',
      'fi': 'Skip calibration',
    },
    btn_next: {
      'en': 'Next',
      'fi': 'Seuraava',
    },
    btn_finish: {
      'en': 'Finish',
      'fi': 'Lopeta',
    },
    btn_thanks: {
      'en': 'Thank you!',
      'fi': 'Kiitos!',
    },

    msg_tracking_lost: {
      'en': 'Gaze tracking is not available',
      'fi': 'Gaze tracking is not available',
    },
    msg_tracker_not_calibrated: {
      'en': 'The tracker is not calibrated yet',
      'fi': 'The tracker is not calibrated yet',
    },
    msg_calib_window_not_visible: {
      'en': 'If you pressed CALIBRATE and calibration window is not visible, please minimize the browser: the calibration window is located below it.',
      'fi': 'If you pressed CALIBRATE and calibration window is not visible, please minimize the browser: the calibration window is located below it.',
    },
    hdr_cannot_conect: {
      'en': 'Cannot connect to a gaze tracker',
      'fi': 'Cannot connect to a gaze tracker',
    },
    msg_cannot_conect_1: {
      'en': 'Possible reasons:',
      'fi': 'Possible reasons:',
    },
    msg_cannot_conect_2: {
      'en': 'ETU-Driver service is not running',
      'fi': 'ETU-Driver service is not running',
    },
    msg_cannot_conect_3: {
      'en': 'ETU-Driver service is running, but its WebSocket server is not enabled',
      'fi': 'ETU-Driver service is running, but its WebSocket server is not enabled',
    },
  },

  modal_error: {
    title: {
      'en': 'Assignment error',
      'fi': 'Assignment error',
    },
  },

  teachers: {
    hdr_new: {
      'en': 'Add teacher',
      'fi': 'Uusi opettaja',
    },

    msg_no_teachers: {
      'en': 'No teachers exists yet',
      'fi': 'No teachers exists yet',
    },
    msg_moved: {
      'en': 'The teacher was moved to another school',
      'fi': 'The teacher was moved to another school',
    },

    err_exists: {
      'en': 'A teacher with this email exists already',
      'fi': 'A teacher with this email exists already',
    },
    err_move: {
      'en': 'Failed to move the teacher to another school',
      'fi': 'Failed to move the teacher to another school',
    },
  },

  students: {
    hdr_new: {
      'en': 'New student',
      'fi': 'Uusi opiskelija',
    },

    msg_no_students: {
      'en': 'No students exists yet',
      'fi': 'No students exists yet',
    },
    msg_moved: {
      'en': 'The student was moved to another school',
      'fi': 'The student was moved to another school',
    },

    err_load_teacher: {
      'en': 'Failed to load teacher\'s school',
      'fi': 'Failed to load teacher\'s school',
    },
    err_exists: {
      'en': 'A student with this email or ID exists already',
      'fi': 'A student with this email or ID exists already',
    },
    err_move: {
      'en': 'Failed to move the student to another school',
      'fi': 'Failed to move the student to another school',
    },
    err_access_school: {
      'en': 'Failed to access the student school',
      'fi': 'Failed to access the student school',
    },
  },

  instructions: {
    hdr_new: {
      'en': 'New instruction',
      'fi': 'Uusi ohje',
    },
    hdr_editor: {
      'en': 'Instruction editor',
      'fi': 'Instruction editor',
    },

    msg_no_instructions: {
      'en': 'No instructions exists yet',
      'fi': 'Ei ohjeetta',
    },

    err_exists: {
      'en': 'An instructions of this name exists already',
      'fi': 'An instructions of this name exists already',
    },

    tit_edit: {
      'en': 'Edit instruction',
      'fi': 'Edit instruction',
    },
    tit_delete: {
      'en': 'Delete instruction',
      'fi': 'Delete instruction',
    },
  },

  instruction_editor: {
    hdr_texts: {
      'en': 'Texts',
      'fi': 'Tekstit',
    },

    msg_instruction_invalid: {
      'en': 'instruction is too short',
      'fi': 'ohje on liian lyhyt',
    },

    ph_calib_inst: {
      'en': 'Calibration instruction',
      'fi': 'Calibration instruction',
    },
    ph_start_inst: {
      'en': 'Start instruction',
      'fi': 'Start instruction',
    },
    ph_first_page: {
      'en': 'First page',
      'fi': 'First page',
    },
  },

  classes: {
    hdr_new: {
      'en': 'New class',
      'fi': 'Uusi ryhmä',
    },

    tit_delete_class: {
      'en': 'Delete the class',
      'fi': 'Delete the class',
    },

    err_name_exists: {
      'en': 'A class of this name exists already',
      'fi': 'A class of this name exists already',
    },
  },

  task_list: {
    btn_new: {
      'en': 'Create new',
      'fi': 'Create new',
    },

    lbl_pages: {
      'en': /** @param {any} p1 */ p1 => `${p1} pages`,
      'fi': /** @param {any} p1 */ p1 => `${p1} pages`,
    },

    tit_edit: {
      'en': /** @param {boolean} p1 */ p1 => p1 ? 'This task has recorded sessions' : 'Edit the task',
      'fi': /** @param {boolean} p1 */ p1 => p1 ? 'This task has recorded sessions' : 'Edit the task',
    },
    tit_copy: {
      'en': 'Create a new task from the existing',
      'fi': 'Create a new task from the existing',
    },
    tti_delete: {
      'en': 'Delete the task',
      'fi': 'Delete the task',
    },

    msg_delete_warning: {
      'en': 'All students assignments completed on this task will be deleted as well',
      'fi': 'All students assignments completed on this task will be deleted as well',
    },
    msg_cancel_warning: {
      'en': 'All changes will be lost. OK to continue?',
      'fi': 'All changes will be lost. OK to continue?',
    },

    hdr_editor: {
      'en': /** @param {any} p1 */ p1 => `Task editor${p1}`,
      'fi': /** @param {any} p1 */ p1 => `Task editor${p1}`,
    },

    err_same_name: {
      'en': 'A task with the same name exists already',
      'fi': 'A task with the same name exists already',
    },
  },

  student_list: {
    lbl_add: {
      'en': 'Add an assignment',
      'fi': 'Add an assignment',
    },

    tit_remove: {
      'en': 'Remove the student from this class',
      'fi': 'Remove the student from this class',
    },
    tit_students: {
      'en': 'Available students',
      'fi': 'Available students',
    },

    data_grade: {
      'en': 'grade',
      'fi': 'luokka',
    },
    data_student: {
      'en': 'student',
      'fi': 'opiskelija',
    },

    err_load_school: {
      'en': 'Failed to load the teacher\'s school',
      'fi': 'Failed to load the teacher\'s school',
    },
    err_load_school_students: {
      'en': 'Failed to load the school\'s students',
      'fi': 'Failed to load the school\'s students',
    },
    err_add_assig: {
      'en': 'Failed to assign the task',
      'fi': 'Failed to assign the task',
    },
    err_remove_assig: {
      'en': 'Failed to remove the assignment',
      'fi': 'Failed to remove the assignment',
    },

    msg_students_added: {
      'en': 'Students were added',
      'fi': 'Students were added',
    },
    msg_assig_added: {
      'en': 'The task was assigned',
      'fi': 'The task was assigned',
    },
    msg_assig_removed: {
      'en': 'The assignment was removed',
      'fi': 'The assignment was removed',
    },
  },

  remove_warning: {
    header: {
      'en': /** @param {any} p1 */ p1 => `Deleting ${p1}`,
      'fi': /** @param {any} p1 */ p1 => `Deleting ${p1}`,
    },
    warning: {
      'en': /** @param {any} p1 @param {any} p2 */ (p1, p2) => `The ${p1} "${p2}" will be deleted permanently`,
      'fi': /** @param {any} p1 @param {any} p2 */ (p1, p2) => `The ${p1} "${p2}" will be deleted permanently`,
    },
    continue: {
      'en': 'Continue?',
      'fi': 'Continue?',
    },
  },

  task_editor: {
    btn_preview: {
      'en': 'Preview',
      'fi': 'Preview',
    },
    btn_set_default: {
      'en': 'Set as default',
      'fi': 'Set as default',
    },

    lbl_use_timeout: {
      'en': 'Use timeout:',
      'fi': 'Use timeout:',
    },
    lbl_minute: {
      'en': 'min.',
      'fi': 'min.',
    },
    lbl_record_audio: {
      'en': 'Record audio',
      'fi': 'Record audio',
    },

    lbl_alignment: {
      'en': 'Alignment',
      'fi': 'Alignment',
    },
    lbl_font: {
      'en': 'Font',
      'fi': 'Font',
    },
    lbl_formatting: {
      'en': 'Formatting',
      'fi': 'Formatting',
    },

    item_center: {
      'en': 'center',
      'fi': 'center',
    },
    item_left: {
      'en': 'left',
      'fi': 'left',
    },
    item_none: {
      'en': 'none',
      'fi': 'none',
    },

    msg_not_editable: {
      'en': 'The task contains images bound to words and therefore its text cannot be modified.',
      'fi': 'The task contains images bound to words and therefore its text cannot be modified.',
    },
  },

  task_editor_feedback: {
    lbl_speech: {
      'en': 'Speech',
      'fi': 'Speech',
    },
    lbl_syllab: {
      'en': 'Syllabification',
      'fi': 'Syllabification',
    },
    lbl_syllabs: {
      'en': 'Syllabifications',
      'fi': 'Syllabifications',
    },
    lbl_temp: {
      'en': 'temporary',
      'fi': 'temporary',
    },
    lbl_word: {
      'en': 'word-length dependent',
      'fi': 'word-length dependent',
    },
    lbl_exceptions: {
      'en': 'Exceptions',
      'fi': 'Exceptions',
    },
    lbl_example: {
      'en': 'Example: maailma=maa il ma',
      'fi': 'Example: maailma=maa il ma',
    },

    item_none: {
      'en': 'none',
      'fi': 'none',
    },
    item_fixed: {
      'en': 'fixed',
      'fi': 'fixed',
    },
    item_calib: {
      'en': 'calibrated',
      'fi': 'calibrated',
    },
    item_colors: {
      'en': 'colors',
      'fi': 'värit',
    },
    item_hyphen: {
      'en': 'hyphen',
      'fi': 'hyphen',
    },
  },

  task_editor_images: {
    lbl_preview: {
      'en': 'Preview',
      'fi': 'Preview',
    },
    lbl_page: {
      'en': 'Page',
      'fi': 'Sivu',
    },
    lbl_location: {
      'en': 'Location',
      'fi': 'Paikka',
    },
    lbl_size: {
      'en': 'Size',
      'fi': 'Koko',
    },
    lbl_on: {
      'en': 'On',
      'fi': 'On',
    },
    lbl_off: {
      'en': 'Off',
      'fi': 'Off',
    },
    lbl_keep_size: {
      'en': /** @param {boolean} p1 */ p1 => p1 ? 'original' : 'shrinked',
      'fi': /** @param {boolean} p1 */ p1 => p1 ? 'original' : 'shrinked',
    },
    lbl_bytes: {
      'en': 'bytes',
      'fi': 'bytes',
    },
    lbl_pixels: {
      'en': 'pixels from',
      'fi': 'pixels from',
    },
    lbl_show: {
      'en': 'Show',
      'fi': 'Show',
    },
    lbl_at: {
      'en': 'at',
      'fi': 'at',
    },
    lbl_longer: {
      'en': 'longer than',
      'fi': 'longer than',
    },
    lbl_hide: {
      'en': 'Hide',
      'fi': 'Hide',
    },
    lbl_seconds: {
      'en': 'seconds',
      'fi': 'seconds',
    },

    msg_no_images: {
      'en': 'No images',
      'fi': 'No images',
    },
    msg_choose: {
      'en': 'Choose an image…',
      'fi': 'Choose an image…',
    },
    msg_drag: {
      'en': 'or drag it here',
      'fi': 'or drag it here',
    },
    msg_fix_on_word: {
      'en': 'fixation on word',
      'fi': 'fixation on word',
    },

    tit_params: {
      'en': 'Edit the image appearance parameters',
      'fi': 'Edit the image appearance parameters',
    },
    tit_remove: {
      'en': 'Remove the image',
      'fi': 'Remove the image',
    },

    item_any: {
      'en': 'any',
      'fi': 'any',
    },
    item_left: {
      'en': 'left',
      'fi': 'left',
    },
    item_bottom: {
      'en': 'bottom',
      'fi': 'bottom',
    },
    item_right: {
      'en': 'right',
      'fi': 'right',
    },
    item_original: {
      'en': 'original',
      'fi': 'original',
    },
    item_15: {
      'en': '15% of width / height',
      'fi': '15% of width / height',
    },
    item_initially: {
      'en': 'initially',
      'fi': 'initially',
    },
    item_on_fix: {
      'en': 'on fixation',
      'fi': 'on fixation',
    },
    item_never: {
      'en': 'never',
      'fi': 'never',
    },
    item_when_other: {
      'en': 'when other image is shown',
      'fi': 'when other image is shown',
    },
    item_after: {
      'en': 'after',
      'fi': 'after',
    },

    btn_upload: {
      'en': 'Upload',
      'fi': 'Upload',
    },

    err_image_type: {
      'en': 'Only JPEG and PNG images are supported',
      'fi': 'Only JPEG and PNG images are supported',
    },
    err_image_size: {
      'en': 'File size must not exceed 100 kB',
      'fi': 'File size must not exceed 100 kB',
    },
    err_upload: {
      'en': 'Cannot upload the file',
      'fi': 'Cannot upload the file',
    },
  },

  task_editor_quest: {
    lbl_for: {
      'en': 'For',
      'fi': 'For',
    },
    lbl_text: {
      'en': 'Text',
      'fi': 'Teksti',
    },

    item_text: {
      'en': 'whole text',
      'fi': 'whole text',
    },
    item_word: {
      'en': 'long-gazed word',
      'fi': 'long-gazed word',
    },

    ph_word: {
      'en': 'Word',
      'fi': 'Word',
    },
    ph_question: {
      'en': 'Question',
      'fi': 'Kysymys',
    },
    ph_answer: {
      'en': 'answer',
      'fi': 'answer',
    },
  },

  task_text_format: {
    rules: {
      'en': 'Rules',
      'fi': 'Rules',
    },
    empty_line: {
      'en': 'Empty line',
      'fi': 'Empty line',
    },
    separator: {
      'en': 'page separator',
      'fi': 'page separator',
    },
    styles: {
      'en': 'applies comma-separated styles listed afterward for',
      'fi': 'applies comma-separated styles listed afterward for',
    },
    word: {
      'en': 'a word',
      'fi': 'a word',
    },
    line: {
      'en': 'a line',
      'fi': 'a line',
    },
    lighter: {
      'en': '25% lighter than the normal text',
      'fi': '25% lighter than the normal text',
    },
    darker: {
      'en': '25% darker than the normal text',
      'fi': '25% darker than the normal text',
    },
    color: {
      'en': 'font color',
      'fi': 'font color',
    },
    size: {
      'en': 'font size',
      'fi': 'font size',
    },
    style: {
      'en': 'font style',
      'fi': 'font style',
    },
    weight: {
      'en': 'font weight',
      'fi': 'font weight',
    },
    example: {
      'en': 'Example',
      'fi': 'Example',
    },
  },

  selection_box: {
    lbl_select: {
      'en': /** @param {any} p1 */ p1 => `Select a ${p1}`,
      'fi': /** @param {any} p1 */ p1 => `Select a ${p1}`,
    },
    lbl_no_avail: {
      'en': /** @param {any} p1 */ p1 => `No available ${p1}`,
      'fi': /** @param {any} p1 */ p1 => `No available ${p1}`,
    },

    btn_select: {
      'en': 'Select',
      'fi': 'Select',
    },
    btn_select_all: {
      'en': 'Select all',
      'fi': 'Select all',
    },
    btn_remove_all: {
      'en': 'Remove all selections',
      'fi': 'Remove all selections',
    },
  },

  preview: {
    lbl_syllab_word: {
      'en': 'Ctrl + click on a word to syllabify it',
      'fi': 'Ctrl + click on a word to syllabify it',
    },
    lbl_speak_word: {
      'en': 'Alt + click on a word to pronounce it',
      'fi': 'Alt + click on a word to pronounce it',
    },

    btn_syllab_all: {
      'en': 'Syllabify all',
      'fi': 'Syllabify all',
    },
    btn_close: {
      'en': 'Close',
      'fi': 'Sulje',
    },
  },

  results: {
    msg_no_data: {
      'en': 'No data was recorded yet',
      'fi': 'No data was recorded yet',
    },

    btn_durations: {
      'en': 'Durations',
      'fi': 'Durations',
    },
    btn_gaze_plot: {
      'en': 'Gaze plot',
      'fi': 'Gaze plot',
    },
    btn_gaze_replay: {
      'en': 'Gaze replay',
      'fi': 'Gaze replay',
    },
    btn_audio_replay: {
      'en': 'Audio replay',
      'fi': 'Audio replay',
    },
    btn_word_replay: {
      'en': 'Word replay',
      'fi': 'Word replay',
    },
    btn_questionnaire: {
      'en': 'Questionnaire',
      'fi': 'Questionnaire',
    },
    btn_summary: {
      'en': 'Summary',
      'fi': 'Summary',
    },
    btn_edit: {
      'en': 'Edit',
      'fi': 'Edit',
    },

    data_grade: {
      'en': 'grade',
      'fi': 'luokka',
    },
    data_student: {
      'en': 'student',
      'fi': 'opiskelija',
    },
    data_session: {
      'en': 'session',
      'fi': 'session',
    },

    tit_sessions: {
      'en': /** @param {any} p1 */ p1 => `Sessions by ${p1}`,
      'fi': /** @param {any} p1 */ p1 => `Sessions by ${p1}`,
    },
    tit_students: {
      'en': /** @param {any} p1 */ p1 => `Students completed "${p1}"`,
      'fi': /** @param {any} p1 */ p1 => `Students completed "${p1}"`,
    },
    tit_students_of: {
      'en': /** @param {any} p1 */ p1 => `students of "${p1}"`,
      'fi': /** @param {any} p1 */ p1 => `students of "${p1}"`,
    },

    err_load_classes: {
      'en': 'Failed to load classes',
      'fi': 'Failed to load classes',
    },
    err_load_student: {
      'en': 'Failed to load student data',
      'fi': 'Failed to load student data',
    },
  },

  session_box: {
    err_delete: {
      'en': 'Failed to delete the session',
      'fi': 'Failed to delete the session',
    },
  },

  audio: {
    play: {
      'en': 'Play',
      'fi': 'Play',
    },
    pause: {
      'en': 'Pause',
      'fi': 'Pause',
    },
  },

  control_panel: {
    tit_speech: {
      'en': 'Speech output',
      'fi': 'Speech output',
    },
    tit_syllab: {
      'en': 'Syllabification',
      'fi': 'Syllabification',
    },
    tit_quest: {
      'en': 'Questionnaire corectness',
      'fi': 'Questionnaire corectness',
    },
    tit_prev: {
      'en': 'Previous page',
      'fi': 'Previous page',
    },
    tit_next: {
      'en': 'Next page',
      'fi': 'Next page',
    },
    tit_settings: {
      'en': 'Settings',
      'fi': 'Settings',
    },
    tit_close: {
      'en': 'Close this visualization',
      'fi': 'Close this visualization',
    },

    lbl_intro: {
      'en': 'int',  // 'intro', max length of 3 chars 
      'fi': 'int',  
    },
  },

  vis: {
    hdr_commons: {
      'en': 'Common',
      'fi': 'Common',
    },
    hdr_reading: {
      'en': /** @param {string} p1 @param {string} p2 @param {string} p3 */ (p1, p2, p3) => 
        `${p1} reading "${p2}" at ${p3}`,
      'fi': /** @param {string} p1 @param {string} p2 @param {string} p3 */ (p1, p2, p3) => 
        `${p1} reading "${p2}" at ${p3}`,
    },
    hdr_quest: {
      'en': /** @param {string} p1 */ p1 => `Questionnaire results in "${p1}"`,
      'fi': /** @param {string} p1 */ p1 => `Questionnaire results in "${p1}"`,
    },
    hdr_missing_data: {
      'en': 'Missing data',
      'fi': 'Missing data',
    },
    hdr_total: {
      'en': 'Total',
      'fi': 'Total',
    },

    lbl_text_color: {
      'en': 'Text color',
      'fi': 'Text color',
    },
    lbl_hl_color: {
      'en': 'Highlighting color',
      'fi': 'Highlighting color',
    },
    lbl_frame_color: {
      'en': 'Word frame color',
      'fi': 'Word frame color',
    },
    lbl_draw_frame: {
      'en': 'Draw word frame',
      'fi': 'Draw word frame',
    },
    lbl_word_color: {
      'en': 'Word color metric',
      'fi': 'Word color metric',
    },
    lbl_syllab_back: {
      'en': 'Syllabification background',
      'fi': 'Syllabification background',
    },
    lbl_syllab_word: {
      'en': 'Syllabification word color',
      'fi': 'Syllabification word color',
    },

    msg_missing_data: {
      'en': 'Fixation data is missing on this page',
      'fi': 'Fixation data is missing on this page',
    },

    item_none: {
      'en': 'none',
      'fi': 'none',
    },
    item_dur: {
      'en': 'duration',
      'fi': 'duration',
    },
    item_char: {
      'en': 'char speed',
      'fi': 'char speed',
    },
    item_focus: {
      'en': 'focus count',
      'fi': 'focus count',
    },
  },

  vis_gaze_plot: {
    hdr_options: {
      'en': 'Gaze Plot',
      'fi': 'Gaze Plot',
    },

    lbl_sacc_color: {
      'en': 'Saccade color',
      'fi': 'Saccade color',
    },
    lbl_reg_sacc_color: {
      'en': 'Regressive saccade color',
      'fi': 'Regressive saccade color',
    },
    lbl_show_conn: {
      'en': 'Show word-fixation connections',
      'fi': 'Show word-fixation connections',
    },
    lbl_show_sacc: {
      'en': 'Show saccades',
      'fi': 'Show saccades',
    },
    lbl_show_fix: {
      'en': 'Show fixations',
      'fi': 'Show fixations',
    },
  },

  vis_durations: {
    hdr_dur: {
      'en': /** @param {string} p1 @param {string} p2 */ (p1, p2) =>
        `Word reading durations in "${p2}"${p1 ? ' for ' + p1 : ''}`,
      'fi': /** @param {string} p1 @param {string} p2 */ (p1, p2) => 
        `Word reading durations in "${p2}"${p1 ? ' for ' + p1 : ''}`,
    },
    hdr_options: {
      'en': 'Durations',
      'fi': 'Durations',
    },

    item_seconds: {
      'en': 'seconds',
      'fi': 'seconds',
    },
    item_percentage: {
      'en': 'percentage',
      'fi': 'percentage',
    },

    lbl_units: {
      'en': 'Units',
      'fi': 'Units',
    },
  },

  vis_word_replay: {
    hdr_word_replay: {
      'en': /** @param {string} p1 @param {string} p2 */ (p1, p2) =>
        `Word replay in "${p2}"${p1 ? ' for ' + p1 : ''}`,
      'fi': /** @param {string} p1 @param {string} p2 */ (p1, p2) =>
        `Word replay in "${p2}"${p1 ? ' for ' + p1 : ''}`,
    },
    hdr_options: {
      'en': 'Word replay',
      'fi': 'Word replay',
    },

    lbl_done: {
      'en': 'done',
      'fi': 'done',
    },
    lbl_no_data: {
      'en': 'no data',
      'fi': 'no data',
    },
    lbl_level_dur: {
      'en': 'Level duration',
      'fi': 'Level duration',
    },
  },

  vis_gaze_replay: {
    lbl_font: {
      'en': 'Name font',
      'fi': 'Name font',
    },
    lbl_font_size: {
      'en': 'Name font size',
      'fi': 'Name font size',
    },
    lbl_spacing: {
      'en': 'Name spacing',
      'fi': 'Name spacing',
    },

    hdr_gaze_replay: {
      'en': /** @param {string} p1 @param {string} p2 */ (p1, p2) =>
        `Gaze replay in "${p2}"${p1 ? ' for ' + p1 : ''}`,
      'fi': /** @param {string} p1 @param {string} p2 */ (p1, p2) =>
        `Gaze replay in "${p2}"${p1 ? ' for ' + p1 : ''}`,
    },
    hdr_options: {
      'en': 'Gaze Replay',
      'fi': 'Gaze Replay',
    },
  },

  vis_summary: {
    tit_wpm: {
      'en': 'Words per minute',
      'fi': 'Words per minute',
    },
    tit_sylpm: {
      'en': 'Syllables per minute (sessions)',
      'fi': 'Syllables per minute (sessions)',
    },
    tit_spw: {
      'en': 'Seconds per word',
      'fi': 'Seconds per word',
    },
    tit_fd: {
      'en': 'Average fixation duration in milliseconds',
      'fi': 'Average fixation duration in milliseconds',
    },
    tit_fsd: {
      'en': 'Fixation standard deviation in milliseconds',
      'fi': 'Fixation standard deviation in milliseconds',
    },
    tit_syllabs: {
      'en': 'Syllabifications',
      'fi': 'Syllabifications',
    },
    tit_regrs: {
      'en': 'Regressions',
      'fi': 'Regressions',
    },

    lbl_time: {
      'en': 'Reading time',
      'fi': 'Reading time',
    },
    lbl_wpm: {
      'en': 'WPM',
      'fi': 'WPM',
    },
    lbl_spm: {
      'en': 'SPM',
      'fi': 'SPM',
    },
    lbl_spw: {
      'en': 'SPW',
      'fi': 'SPW',
    },
    lbl_fix: {
      'en': 'Fixation',
      'fi': 'Fixation',
    },
    lbl_fsd: {
      'en': 'FSD',
      'fi': 'FSD',
    },
  },

  player: {
    tit_restart: {
      'en': 'Restart',
      'fi': 'Restart',
    },
    tit_pause_cont: {
      'en': 'Pause / Continue',
      'fi': 'Pause / Continue',
    },
  },

  options: {
    hdr_settings: {
      'en': 'Settings',
      'fi': 'Settings',
    },

    btn_apply: {
      'en': 'Apply',
      'fi': 'Apply',
    },
    btn_save_close: {
      'en': 'Save and close',
      'fi': 'Save and close',
    },
    btn_reset: {
      'en': 'Reset',
      'fi': 'Reset',
    },
  },

  sgwm: {
    hdr_data_map: {
      'en': 'Data mapping',
      'fi': 'Data mapping',
    },
    hdr_fix_proc: {
      'en': 'Fixation processing',
      'fi': 'Fixation processing',
    },
    hdr_splitter: {
      'en': 'Splitter',
      'fi': 'Splitter',
    },
    hdr_merger: {
      'en': 'Merger',
      'fi': 'Merger',
    },
    hdr_word_map: {
      'en': 'Word mapper',
      'fi': 'Word mapper',
    },

    lbl_loc: {
      'en': 'By location',
      'fi': 'By location',
    },
    lbl_dur: {
      'en': 'By duration',
      'fi': 'By duration',
    },
    lbl_margin: {
      'en': /** @param {string} p1 */ p1 => `margin ${p1}, px`,
      'fi': /** @param {string} p1 */ p1 => `margin ${p1}, px`,
    },
    lbl_merge_th: {
      'en': 'merging threshold, ms',
      'fi': 'merging threshold, ms',
    },
    lbl_merge_dist: {
      'en': 'merging distance, px',
      'fi': 'merging distance, px',
    },
    lbl_min_dur: {
      'en': 'min duration, ms',
      'fi': 'min duration, ms',
    },

    lbl_left_margin: {
      'en': 'Left margin, chars',
      'fi': 'Left margin, chars',
    },
    lbl_right_margin: {
      'en': 'Right margin, chars',
      'fi': 'Right margin, chars',
    },
    lbl_v_margin_char: {
      'en': 'Vertical margin, chars',
      'fi': 'Vertical margin, chars',
    },
    lbl_v_margin_lines: {
      'en': 'Vertical margin, lines',
      'fi': 'Vertical margin, lines',
    },
    lbl_incline: {
      'en': 'Max incline, rad',
      'fi': 'Max incline, rad',
    },

    lbl_short_prog: {
      'en': 'Shortest progression, fixations',
      'fi': 'Shortest progression, fixations',
    },
    lbl_line_sep: {
      'en': 'Line separation threshold, lines',
      'fi': 'Line separation threshold, lines',
    },
    lbl_line_incline: {
      'en': 'Max line incline, rad',
      'fi': 'Max line incline, rad',
    },
    lbl_remove_fix: {
      'en': 'Remove unmerged single fixations',
      'fi': 'Remove unmerged single fixations',
    },
    lbl_empty_lines: {
      'en': 'Account for empty lines',
      'fi': 'Account for empty lines',
    },
    lbl_support_line: {
      'en': 'support current line by',
      'fi': 'support current line by',
    },
    lbl_empty_line: {
      'en': 'empty line factor, lines',
      'fi': 'empty line factor, lines',
    },
    lbl_first_line: {
      'en': 'Intelligent first reading line search',
      'fi': 'Intelligent first reading line search',
    },

    lbl_skip_start: {
      'en': 'Skip from start, chars',
      'fi': 'Skip from start, chars',
    },
    lbl_skip_end: {
      'en': 'Skip from end, chars',
      'fi': 'Skip from end, chars',
    },
    lbl_scale: {
      'en': 'Scaling diff limit',
      'fi': 'Scaling diff limit',
    },
    lbl_rescale: {
      'en': 'Rescale fixations horizontally',
      'fi': 'Rescale fixations horizontally',
    },
    lbl_short_word: {
      'en': 'short word, chars',
      'fi': 'short word, chars',
    },
    lbl_limit: {
      'en': 'limit to',
      'fi': 'limit to',
    },
    lbl_ignore_trans: {
      'en': 'Ignore transitions',
      'fi': 'Ignore transitions',
    },
  },

  _utils: {
    num_student: {
      'en': /** @param {[]} p1 */ p1 => (p1 && p1.length) ? p1.length + ' student' + (p1.length !== 1 ? 's' : '') : 'No students',
      'fi': /** @param {[]} p1 */ p1 => (p1 && p1.length) ? p1.length + ' opiskelija' + (p1.length !== 1 ? 'a' : '') : 'Ei opiskelijoita',
    },
    num_task: {
      'en': /** @param {[]} p1 */ p1 => (p1 && p1.length) ? p1.length + ' task' + (p1.length !== 1 ? 's' : '') : 'No tasks',
      'fi': /** @param {[]} p1 */ p1 => (p1 && p1.length) ? p1.length + ' tehtävä' + (p1.length !== 1 ? 'ä' : '') : 'Ei tehtäviä',
    },
  },

  _buttons: {
    manual: {
      'en': 'Manual',
      'fi': 'Manual',
    },
    create: {
      'en': 'Create',
      'fi': 'Create',
    },
    save: {
      'en': 'Save',
      'fi': 'Tallenna',
    },
    ok: {
      'en': 'OK',
      'fi': 'OK',
    },
    cancel: {
      'en': 'Cancel',
      'fi': 'Peruta',
    },
    add: {
      'en': 'Add',
      'fi': 'Lisä',
    },
    start: {
      'en': 'Start',
      'fi': 'Aloita',
    },
  },

  _form: {
    name: {
      'en': 'Name',
      'fi': 'Nimi',
    },
    email: {
      'en': 'Email',
      'fi': 'Sähköposti',
    },
    email_id: {
      'en': 'Email or ID',
      'fi': 'Sähköposti tai ID',
    },
    password: {
      'en': 'Password',
      'fi': 'Salasana',
    },

    name_invalid: {
      'en': 'name is too short',
      'fi': 'nimi on liian lyhyt',
    },
    email_invalid: {
      'en': 'email is not valid',
      'fi': 'sähköposti on väärässä muodossa',
    },
    password_invalid: {
      'en': 'password is too short',
      'fi': 'salasana on liian lyhyt',
    },
  },

  _labels: {
    school: {
      'en': 'School',
      'fi': 'Koulu',
    },
    schools: {
      'en': 'Schools',
      'fi': 'Koulut',
    },
    teacher: {
      'en': 'Teacher',
      'fi': 'Opettaja',
    },
    teachers: {
      'en': 'Teachers',
      'fi': 'Opettajat',
    },
    student: {
      'en': 'Student',
      'fi': 'Opiskelija',
    },
    students: {
      'en': 'Students',
      'fi': 'Opiskelijat',
    },
    instruction: {
      'en': 'Instruction',
      'fi': 'Ohje',
    },
    instructions: {
      'en': 'Instructions',
      'fi': 'Ohjeet',
    },
    class: {
      'en': 'Class',
      'fi': 'Ryhmä',
    },
    classes: {
      'en': 'Classes',
      'fi': 'Ryhmät',
    },
    grade: {
      'en': 'Grade',
      'fi': 'Luokka',
    },
    task: {
      'en': 'Task',
      'fi': 'Tehtävä',
    },
    tasks: {
      'en': 'Tasks',
      'fi': 'Tehtävät',
    },
    action: {
      'en': 'Actions',
      'fi': 'Actions',
    },
    text: {
      'en': 'Text',
      'fi': 'Teksti',
    },
    image: {
      'en': 'Image',
      'fi': 'Image',
    },
    assignments: {
      'en': 'Assignments',
      'fi': 'Tehtävät',
    },
    sessions: {
      'en': 'Sessions',
      'fi': 'Sessions',
    },
    date: {
      'en': 'Date',
      'fi': 'Aika',
    },
  },

  _failures: {
    load: {
      'en': /** @param {string} p1 */ p1 => `Failed to load ${p1.toLowerCase()}`,
      'fi': /** @param {string} p1 */ p1 => `Failed to load ${p1.toLowerCase()}`,
    },
    create_new: {
      'en': /** @param {string} p1 */ p1 => `Failed to create ${p1.toLowerCase()}`,
      'fi': /** @param {string} p1 */ p1 => `Failed to create ${p1.toLowerCase()}`,
    },
    add_new: {
      'en': /** @param {string} p1 */ p1 => `Failed to add a new ${p1.toLowerCase()}`,
      'fi': /** @param {string} p1 */ p1 => `Failed to add a new ${p1.toLowerCase()}`,
    },
    update: {
      'en': /** @param {string} p1 */ p1 => `Failed to update the ${p1.toLowerCase()}`,
      'fi': /** @param {string} p1 */ p1 => `Failed to update the ${p1.toLowerCase()}`,
    },
    delete: {
      'en': /** @param {string} p1 */ p1 => `Failed to delete the ${p1.toLowerCase()}`,
      'fi': /** @param {string} p1 */ p1 => `Failed to delete the ${p1.toLowerCase()}`,
    },
    remove: {
      'en': /** @param {string} p1 */ p1 => `Failed to remove the ${p1.toLowerCase()}`,
      'fi': /** @param {string} p1 */ p1 => `Failed to remove the ${p1.toLowerCase()}`,
    },

    added: {
      'en': /** @param {string} p1 */ p1 => `The ${p1.toLowerCase()} was added`,
      'fi': /** @param {string} p1 */ p1 => `The ${p1.toLowerCase()} was added`,
    },
    created: {
      'en': /** @param {string} p1 */ p1 => `The ${p1.toLowerCase()} was created`,
      'fi': /** @param {string} p1 */ p1 => `The ${p1.toLowerCase()} was created`,
    },
    updated: {
      'en': /** @param {string} p1 */ p1 => `The ${p1.toLowerCase()} was updated`,
      'fi': /** @param {string} p1 */ p1 => `The ${p1.toLowerCase()} was updated`,
    },
    deleted: {
      'en': /** @param {string} p1 */ p1 => `The ${p1.toLowerCase()} was deleted`,
      'fi': /** @param {string} p1 */ p1 => `The ${p1.toLowerCase()} was deleted`,
    },
    removed: {
      'en': /** @param {string} p1 */ p1 => `The ${p1.toLowerCase()} was removed`,
      'fi': /** @param {string} p1 */ p1 => `The ${p1.toLowerCase()} was removed`,
    },
  },
};

export let langs = [ 'en', 'fi' ];

/**
 * @param {string[]} repoNames 
 * @returns {Object.<string,string>}
 */
export function i10n( ...repoNames ) {
  /** @type {Object.<string,string>} */
  const result = {};

  let lang = db.user ? db.user.prefs.lang : 'en';

  lang = lang.toLowerCase();
  if (langs.indexOf( lang ) < 0) {
    lang = langs[0];
  }

  repoNames.forEach( name => {
    /** @type {Object.<string,any>} */
    const repo = repos[ name ];
    if (repo) {
      for (let token in repo) {
        result[ token ] = repo[ token ][ lang ];
      }
    }
  });

  return result;
}