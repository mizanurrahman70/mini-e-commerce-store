'use strict';

module.exports = (plugin) => {
  const fetchUserWithRole = (strapi, id) =>
    strapi
      .plugin('users-permissions')
      .service('user')
      .fetch(id, { populate: ['role'] });

  const loadRoleAndPermissions = async (strapi, roleId) => {
    let role = null;
    let permissions = null;

    if (roleId) {
      try {
        const fullRole = await strapi
          .plugin('users-permissions')
          .service('role')
          .findOne(roleId);

        if (fullRole) {
          role = { id: fullRole.id, name: fullRole.name, type: fullRole.type };
          permissions = fullRole.permissions;
        }
      } catch (err) {
        strapi.log.warn(`[users-permissions] me: failed to load role permissions: ${err.message}`);
      }
    }

    return { role, permissions };
  };

  const originalMe = plugin.controllers.user.me;
  plugin.controllers.user.me = async (ctx) => {
    await originalMe(ctx);

    if (ctx.state.user && ctx.body) {
      const user = await fetchUserWithRole(strapi, ctx.state.user.id);
      if (user && user.role) {
        const { role, permissions } = await loadRoleAndPermissions(strapi, user.role.id);
        ctx.body.role = role;
        ctx.body.permissions = permissions;
      }
    }
  };

  plugin.controllers.user.profile = async (ctx) => {
    if (!ctx.state.user || !ctx.state.user.id) {
      return ctx.unauthorized('Not authenticated');
    }

    const user = await fetchUserWithRole(strapi, ctx.state.user.id);
    if (!user) return ctx.notFound('User not found');

    const { role, permissions } = await loadRoleAndPermissions(
      strapi,
      user.role ? user.role.id : null
    );

    ctx.body = {
      id: user.id,
      documentId: user.documentId,
      username: user.username,
      email: user.email,
      confirmed: user.confirmed,
      blocked: user.blocked,
      role,
      permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  };

  plugin.routes['content-api'].routes.push({
    method: 'GET',
    path: '/users/profile',
    handler: 'user.profile',
    config: { prefix: '' },
  });

  return plugin;
};