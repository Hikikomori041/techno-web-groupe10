export interface ShippingAddressInput {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderInput {
  shippingAddress: ShippingAddressInput;
}

