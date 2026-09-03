'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap: async ({ strapi }) => {
    // Ensure new public registrations are assigned the "Customer" role by
    // default. Strapi v5 reads the role `type` from the plugin advanced
    // settings (`default_role`), NOT from the request body, so we pin it here
    // so the "Register" default follows the Customer role even after a fresh
    // install or admin changes. Idempotent — safe to run on every start.
    try {
      const customerRole = await strapi
        .db.query('plugin::users-permissions.role')
        .findOne({ where: { type: 'customer' } });
      if (customerRole) {
        const current = await strapi
          .store({
            type: 'plugin',
            name: 'users-permissions',
            key: 'advanced',
          })
          .get();
        if (current?.default_role !== 'customer') {
          await strapi
            .store({
              type: 'plugin',
              name: 'users-permissions',
              key: 'advanced',
            })
            .set({ value: { ...current, default_role: 'customer' } });
          strapi.log.info(
            `[bootstrap] default registration role set to '${customerRole.name}'`
          );
        }
      }
    } catch (err) {
      strapi.log.warn(
        `[bootstrap] default role ensure skipped: ${err.message}`
      );
    }

    try {
      const plugin = strapi.plugin('users-permissions');
      const roleService = plugin.service('role');

      const roles = await strapi
        .db.query('plugin::users-permissions.role')
        .findMany();

      for (const role of roles) {
        if (role.type === 'public' || role.type === 'admin') continue;

        try {
          const full = await roleService.findOne(role.id);
          const up = full?.permissions?.['plugin::users-permissions'];
          const me = up?.controllers?.user?.me;

          // Only touch the role when the permission is not already enabled.
          if (me && !me.enabled) {
            // Flip it on, then sync the role's permissions with the map.
            me.enabled = true;
            await roleService.updateRole(role.id, {
              ...full,
              permissions: full.permissions,
            });
            strapi.log.info(
              `[bootstrap] enabled 'user.me' for role '${role.name}'`
            );
          }
        } catch (err) {
          strapi.log.warn(
            `[bootstrap] could not update role '${role.name}': ${err.message}`
          );
        }
      }
    } catch (err) {
      strapi.log.warn(`[bootstrap] user.me grant skipped: ${err.message}`);
    }
  },
};
