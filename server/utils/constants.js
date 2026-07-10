const RECIPIENT_CATEGORIES = [
  { value: 'GMR', label: 'GMR / General Manager Railways', shortLabel: 'GMR', sortOrder: 1 },
  { value: 'Secretary', label: 'Secretary', shortLabel: 'Sec', sortOrder: 2 },
  { value: 'Additional Directors', label: 'Additional Directors', shortLabel: 'Addl Dir', sortOrder: 3 },
  { value: 'Additional Secretaries - Administration', label: 'Additional Secretaries - Administration', shortLabel: 'Addl Sec Admin', sortOrder: 4, secretaryUsername: 'sec-admin' },
  { value: 'Additional Secretaries - Development', label: 'Additional Secretaries - Development', shortLabel: 'Addl Sec Dev', sortOrder: 5, secretaryUsername: 'sec-dev' },
  { value: 'Additional Secretaries - Engineering', label: 'Additional Secretaries - Engineering', shortLabel: 'Addl Sec Eng', sortOrder: 6, secretaryUsername: 'sec-eng' },
  { value: 'Additional Secretaries - SLAcS Special', label: 'Additional Secretaries - SLAcS Special', shortLabel: 'SLAcS', sortOrder: 7, secretaryUsername: 'sec-slacs' },
  { value: 'Additional Secretaries - SLPS Special', label: 'Additional Secretaries - SLPS Special', shortLabel: 'SLPS', sortOrder: 8, secretaryUsername: 'sec-slps' },
  { value: 'Additional Secretaries - Special Projects', label: 'Additional Secretaries - Special Projects', shortLabel: 'Special', sortOrder: 9, secretaryUsername: 'sec-special' },
  { value: 'PSC', label: 'PSC', shortLabel: 'PSC', sortOrder: 10 },
  { value: 'PUBAD', label: 'PUBAD', shortLabel: 'PUBAD', sortOrder: 11 },
  { value: 'Pension Department', label: 'Pension Department', shortLabel: 'Pension', sortOrder: 12 },
  { value: 'DMS', label: 'DMS', shortLabel: 'DMS', sortOrder: 13 },
  { value: 'Other', label: 'Other', shortLabel: 'Other', sortOrder: 14 },
  { value: 'All', label: 'All', shortLabel: 'All', sortOrder: 15 },
];

const SECRETARY_CATEGORY_MAP = {
  'sec-admin': 'Additional Secretaries - Administration',
  'sec-dev': 'Additional Secretaries - Development',
  'sec-eng': 'Additional Secretaries - Engineering',
  'sec-slacs': 'Additional Secretaries - SLAcS Special',
  'sec-slps': 'Additional Secretaries - SLPS Special',
  'sec-special': 'Additional Secretaries - Special Projects',
};

const DEMO_USERS = [
  { username: 'admin', password: 'Password@123', fullName: 'System Admin', employeeId: 'admin', designation: 'System Administrator', role: 'admin' },
  { username: 'hod', password: 'Password@123', fullName: 'Head of Department', employeeId: '152', designation: 'Head of Department', role: 'head' },
  { username: 'priyangani', password: 'Password@123', fullName: 'Priyangani', employeeId: '151', designation: 'Department Officer', role: 'officer' },
  { username: 'gayanthi', password: 'Password@123', fullName: 'Gayanthi', employeeId: '135', designation: 'Department Officer', role: 'officer' },
  { username: 'purnima', password: 'Password@123', fullName: 'Purnima', employeeId: '142', designation: 'Department Officer', role: 'officer' },
  { username: 'dulani', password: 'Password@123', fullName: 'Dulani', employeeId: '141', designation: 'Department Officer', role: 'officer' },
  { username: 'chathura', password: 'Password@123', fullName: 'Chathura', employeeId: '144', designation: 'Department Officer', role: 'officer' },
  { username: 'erandi', password: 'Password@123', fullName: 'Erandi', employeeId: '143', designation: 'Department Officer', role: 'officer' },
  { username: 'sandareka', password: 'Password@123', fullName: 'Sandareka', employeeId: '140', designation: 'Department Officer', role: 'officer' },
  { username: 'chathurika', password: 'Password@123', fullName: 'Chathurika', employeeId: '137', designation: 'Department Officer', role: 'officer' },
  { username: 'prabhamili', password: 'Password@123', fullName: 'Prabhamili', employeeId: '205', designation: 'Department Officer', role: 'officer' },
  { username: 'sec-admin', password: 'Password@123', fullName: 'Addl. Sec. (Administration)', employeeId: 'sec-admin', designation: 'Additional Secretary (Administration)', role: 'secretary', secretaryCategory: 'Additional Secretaries - Administration' },
  { username: 'sec-dev', password: 'Password@123', fullName: 'Addl. Sec. (Development)', employeeId: 'sec-dev', designation: 'Additional Secretary (Development)', role: 'secretary', secretaryCategory: 'Additional Secretaries - Development' },
  { username: 'sec-eng', password: 'Password@123', fullName: 'Addl. Sec. (Engineering)', employeeId: 'sec-eng', designation: 'Additional Secretary (Engineering)', role: 'secretary', secretaryCategory: 'Additional Secretaries - Engineering' },
  { username: 'sec-slacs', password: 'Password@123', fullName: 'Addl. Sec. (SLAcS Special)', employeeId: 'sec-slacs', designation: 'Additional Secretary (SLAcS Special)', role: 'secretary', secretaryCategory: 'Additional Secretaries - SLAcS Special' },
  { username: 'sec-slps', password: 'Password@123', fullName: 'Addl. Sec. (SLPS Special)', employeeId: 'sec-slps', designation: 'Additional Secretary (SLPS Special)', role: 'secretary', secretaryCategory: 'Additional Secretaries - SLPS Special' },
  { username: 'sec-special', password: 'Password@123', fullName: 'Addl. Sec. (Special Projects)', employeeId: 'sec-special', designation: 'Additional Secretary (Special Projects)', role: 'secretary', secretaryCategory: 'Additional Secretaries - Special Projects' },
];

module.exports = { RECIPIENT_CATEGORIES, SECRETARY_CATEGORY_MAP, DEMO_USERS };
