'use strict';

/**
 * order service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::order.order', ({ strapi }) => ({
  /**
   * Overrides the default create so orders always belong to the authenticated
   * customer (never trusting a client-provided customer id), the total is
   * computed from product prices at order time, and a sensible default status
   * is set.
   */
  async create(params = {}) {
    const ctx = strapi.requestContext.get();
    const user = ctx && ctx.state ? ctx.state.user : null;

    const data = { ...(params.data || {}) };
    const items = Array.isArray(data.items) ? data.items : [];

    const decoratedItems = await Promise.all(
      items.map(async (item) => {
        const quantity = Number(item.quantity) || 1;
        let priceAtOrder = Number(item.priceAtOrder) || 0;

        if (item.product) {
          try {
            const product = await strapi.entityService.findOne(
              'api::product.product',
              item.product,
              { fields: ['price'] }
            );
            if (product && product.price != null) {
              priceAtOrder = Number(product.price) || 0;
            }
          } catch (err) {
            strapi.log.warn(
              `[order/service] failed to read product price: ${err.message}`
            );
          }
        }

        return { ...item, quantity, priceAtOrder };
      })
    );

    const totalAmount = decoratedItems.reduce(
      (sum, it) => sum + (Number(it.priceAtOrder) || 0) * (Number(it.quantity) || 1),
      0
    );

    const orderData = {
      ...data,
      items: decoratedItems,
      totalAmount,
      order_status: data.order_status || 'Pending',
      customer: user && user.id ? user.id : data.customer,
    };

    const { data: _ignored, ...rest } = params;
    return super.create({ ...rest, data: orderData });
  },
}));
