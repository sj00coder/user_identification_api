/**
 * Express router paths go here.
 */

export default {
  Base: '/api',
  Contacts: {
    Base: '/contacts',
    Identify: '/identify',
  },
} as const;
