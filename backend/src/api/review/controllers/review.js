'use strict';

/**
 * review controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::review.review', ({ strapi }) => ({
  /**
   * GET /api/reviews — uses the standard content API for querying (it filters
   * by product and populates relations reliably), then enriches each review
   * with its reviewer.
   *
   * The content API does not populate the `customer` relation (a plugin user,
   * inverse side of the relation), so the reviewer is resolved server-side
   * with `entityService` and merged back onto the result.
   */
  async find(ctx) {
    const result = await super.find(ctx);
    const reviews = Array.isArray(result?.data) ? result.data : result?.data ? [result.data] : [];

    if (reviews.length > 0) {
      const authors = await this.resolveCustomerKeys(
        reviews.map((r) => r.documentId ?? r.id)
      );
      for (const review of reviews) {
        review.customer ??= authors.get(String(review.documentId ?? review.id)) ?? null;
      }
    }

    return { data: reviews, meta: result?.meta };
  },

  /** Map review keys (documentId or id) -> the review author object. */
  async resolveCustomerKeys(keys) {
    const entries = await strapi.entityService.findMany('api::review.review', {
      filters: { documentId: { $in: keys } },
      populate: ['customer'],
      fields: ['documentId'],
    });

    const authors = new Map();
    for (const entry of entries) {
      const customer = Array.isArray(entry.customer)
        ? entry.customer[0]
        : entry.customer;
      if (customer) {
        authors.set(String(entry.documentId), {
          id: customer.id,
          documentId: customer.documentId,
          username: customer.username,
          email: customer.email,
        });
      } else {
        authors.set(String(entry.documentId), null);
      }
    }
    return authors;
  },
}));
