import { faker } from '@faker-js/faker';
import { Product } from '../src/products/product.schema';

export function generateFakeProduct(): Partial<Product> {
  return {
    nom: faker.commerce.productName(),
    prix: parseFloat(faker.commerce.price({ min: 10, max: 2000 })),
    description: faker.commerce.productDescription(),
    images: [faker.image.urlLoremFlickr({ category: 'technology' })],
    specifications: {
      cpu: faker.commerce.productAdjective(),
      ram: faker.number.int({ min: 4, max: 64 }) + 'GB',
    },
    id_categorie: faker.number.int({ min: 1, max: 5 }),
  };
}
