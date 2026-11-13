'use strict';

const routeChanges = [
  ['/admin/real-estate', '/real-estate'],
  ['/admin/gold', '/gold'],
  ['/admin/flats', '/flats'],
  ['/admin/rental-properties', '/rental-properties'],
  ['/admin/analytics', '/analytics'],
  ['/admin/notifications', '/notifications'],
  ['/admin/users', '/users'],
  ['/admin/roles', '/roles'],
  ['/admin/data-upload', '/data-upload'],
  ['/admin/user-investment-mapping', '/user-investment-mapping'],
];

module.exports = {
  async up(queryInterface) {
    for (const [oldPath, newPath] of routeChanges) {
      await queryInterface.bulkUpdate('sidebar_items', { href: newPath }, { href: oldPath });
    }
  },

  async down(queryInterface) {
    for (const [oldPath, newPath] of routeChanges) {
      await queryInterface.bulkUpdate('sidebar_items', { href: oldPath }, { href: newPath });
    }
  },
};
