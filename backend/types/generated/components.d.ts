import type { Schema, Struct } from '@strapi/strapi';

export interface SharedOrderAddress extends Struct.ComponentSchema {
  collectionName: 'components_shared_order_addresses';
  info: {
    displayName: 'order.address';
  };
  attributes: {
    city: Schema.Attribute.String;
    phone: Schema.Attribute.String;
    street: Schema.Attribute.String;
  };
}

export interface SharedOrderItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_order_items';
  info: {
    displayName: 'order.item';
  };
  attributes: {
    priceAtOrder: Schema.Attribute.Decimal;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    quantity: Schema.Attribute.Integer;
  };
}

export interface SharedSharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_shared_links';
  info: {
    displayName: 'shared.link';
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SharedSharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_shared_social_links';
  info: {
    displayName: 'shared.social-link';
  };
  attributes: {
    platform: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.order-address': SharedOrderAddress;
      'shared.order-item': SharedOrderItem;
      'shared.shared-link': SharedSharedLink;
      'shared.shared-social-link': SharedSharedSocialLink;
    }
  }
}
