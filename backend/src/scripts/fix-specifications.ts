import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../modules/products/schemas/product.schema';

async function fixSpecifications() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productModel = app.get<Model<Product>>(getModelToken(Product.name));

  console.log('🔧 Starting specifications fix...');

  try {
    const products = await productModel.find().exec();
    console.log(`Found ${products.length} products to check`);

    let fixed = 0;
    let alreadyCorrect = 0;

    for (const product of products) {
      let needsUpdate = false;
      const fixedSpecs: Array<{ key: string; value: string }> = [];

      if (product.specifications && Array.isArray(product.specifications)) {
        for (const spec of product.specifications) {
          // Check if the value is an object instead of a string
          if (typeof spec.value === 'object' && spec.value !== null) {
            console.log(`\n⚠️  Product "${product.nom}" has incorrect specification format`);
            console.log(`   Current: ${JSON.stringify(spec)}`);
            
            // Extract the actual value from the nested object
            const actualValue = (spec.value as any).value || String(spec.value);
            fixedSpecs.push({
              key: spec.key,
              value: actualValue,
            });
            
            needsUpdate = true;
            console.log(`   Fixed: { key: "${spec.key}", value: "${actualValue}" }`);
          } else {
            // Value is already correct (string)
            fixedSpecs.push({
              key: spec.key,
              value: String(spec.value),
            });
          }
        }

        if (needsUpdate) {
          // Update the product with fixed specifications
          await productModel.updateOne(
            { _id: product._id },
            { $set: { specifications: fixedSpecs } }
          );
          fixed++;
          console.log(`   ✅ Product "${product.nom}" fixed`);
        } else {
          alreadyCorrect++;
        }
      }
    }

    console.log('\n✨ Migration completed!');
    console.log(`   - Fixed: ${fixed} products`);
    console.log(`   - Already correct: ${alreadyCorrect} products`);
    console.log(`   - Total: ${products.length} products\n`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await app.close();
  }
}

// Run the migration
fixSpecifications();

