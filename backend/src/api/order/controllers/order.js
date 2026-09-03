'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  /**
   * GET /api/orders — customised so the frontend's "my orders" view is scoped
   * to the logged-in user server-side.
   *
   * The default content API cannot filter the `customer` relation reliably in
   * Strapi v5 (`filters[customer][id][$eq]=$me` returns "Invalid key
   * customer"), so when the reserved `meOnly=true` query flag is present we
   * resolve the user's own orders with `entityService` (whose filter DSL
   * accepts relation-by-id) and return them directly. A normal (admin/vendor)
   * `GET /orders` without the flag falls through to the core handler.
   */
  async find(ctx) {
    const meOnly = ctx.query?.meOnly === 'true' || ctx.query?.meOnly === true;

    if (meOnly) {
      const user = ctx.state?.user;
      if (!user || !user.id) {
        return ctx.unauthorized('Not authenticated');
      }

      const entries = await strapi.entityService.findMany('api::order.order', {
        filters: { customer: { id: user.id } },
        populate: ['customer', 'items.product'],
        sort: { createdAt: 'desc' },
      });

      return { data: entries };
    }

    return super.find(ctx);
  },
}));
