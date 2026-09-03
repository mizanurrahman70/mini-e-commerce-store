'use strict';

/**
 * review service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::review.review', ({ strapi }) => ({
  /**
   * Overrides the default create so a review is always attributed to the
   * authenticated customer (never trusting a client-provided id). The product
   * and rating/comment come from the client as usual.
   *
   * NB: `customer` is the inverse (oneToMany/mappedBy) side of the relation,
   * so it must be supplied as an array of ids, not a bare id.
   */
  async create(params = {}) {
    const ctx = strapi.requestContext.get();
    const user = ctx && ctx.state ? ctx.state.user : null;

    const data = { ...(params.data || {}) };

    let customer = data.customer;
    if (user && user.id) {
      customer = [user.id];
    } else if (Array.isArray(data.customer) && data.customer.length === 1) {
      customer = data.customer;
    }

    const reviewData = { ...data, customer };

    const { data: _ignored, ...rest } = params;
    return super.create({ ...rest, data: reviewData });
  },
}));
