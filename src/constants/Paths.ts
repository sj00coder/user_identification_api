/**
 * Express router paths go here.
 */

export default {
  Base: '/api',
  Users: {
    Base: '/users',
    Get: '/all',
    Identify: '/identify',
  },
} as const;
