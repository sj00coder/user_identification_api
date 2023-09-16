/**
 * Get all users.
 */
function getAll() {
  return [
    {
      id: 1,
      email: 'hdjaskd@ksdlja.cdm',
    },
    {
      id: 2,
      email: 'hdjaskd@ksdlja.cdm',
    },
  ];
}

// **** Export default **** //

export default {
  getAll,
} as const;
