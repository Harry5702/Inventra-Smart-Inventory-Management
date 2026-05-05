import { supabase } from './supabase';
import { initialCategories } from '../data/initialData';

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    const { data: existingCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      console.error('Error loading existing categories:', categoriesError);
      return { success: false, error: categoriesError.message };
    }

    const categoryMap = new Map<string, number>();
    (existingCategories || []).forEach((cat) => {
      categoryMap.set(cat.name, cat.id);
    });

    const inserted = {
      categories: 0,
      subcategories: 0,
      products: 0,
      inventory: 0,
    };

    for (const category of initialCategories) {
      let categoryId = categoryMap.get(category.name);

      if (!categoryId) {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .insert({
            name: category.name,
            is_predefined: true,
          })
          .select('id')
          .single();

        if (catError || !catData) {
          console.error(`Error inserting category "${category.name}":`, catError);
          continue;
        }

        if (typeof catData.id !== 'number') {
          console.error(`Invalid category id for "${category.name}"`);
          continue;
        }

        categoryId = catData.id;
        categoryMap.set(category.name, categoryId);
        inserted.categories++;
      }

      if (typeof categoryId !== 'number') {
        console.error(`Invalid category id for "${category.name}"`);
        continue;
      }

      const { data: existingSubcategories, error: subListError } = await supabase
        .from('subcategories')
        .select('id, name')
        .eq('category_id', categoryId);

      if (subListError) {
        console.error(`Error loading subcategories for "${category.name}":`, subListError);
        continue;
      }

      const subcategoryMap = new Map<string, number>();
      (existingSubcategories || []).forEach((sub) => {
        subcategoryMap.set(sub.name, sub.id);
      });

      for (const subcategory of category.subcategories) {
        let subcategoryId = subcategoryMap.get(subcategory.name);

        if (!subcategoryId) {
          const { data: subData, error: subError } = await supabase
            .from('subcategories')
            .insert({
              category_id: categoryId,
              name: subcategory.name,
            })
            .select('id')
            .single();

          if (subError || !subData) {
            console.error(`Error inserting subcategory "${subcategory.name}":`, subError);
            continue;
          }

          if (typeof subData.id !== 'number') {
            console.error(`Invalid subcategory id for "${subcategory.name}"`);
            continue;
          }

          subcategoryId = subData.id;
          subcategoryMap.set(subcategory.name, subcategoryId);
          inserted.subcategories++;
        }

        if (typeof subcategoryId !== 'number') {
          console.error(`Invalid subcategory id for "${subcategory.name}"`);
          continue;
        }

        const { data: existingProducts, error: prodListError } = await supabase
          .from('products')
          .select('id, name')
          .eq('subcategory_id', subcategoryId);

        if (prodListError) {
          console.error(`Error loading products for "${subcategory.name}":`, prodListError);
          continue;
        }

        const productMap = new Map<string, number>();
        (existingProducts || []).forEach((prod) => {
          productMap.set(prod.name, prod.id);
        });

        for (const product of subcategory.products) {
          let productId = productMap.get(product.name);

          if (!productId) {
            const { data: prodData, error: prodError } = await supabase
              .from('products')
              .insert({
                subcategory_id: subcategoryId,
                name: product.name,
                selling_price: product.price,
                cost_price: product.costPrice,
              })
              .select('id')
              .single();

            if (prodError || !prodData) {
              console.error(`Error inserting product "${product.name}":`, prodError);
              continue;
            }

            if (typeof prodData.id !== 'number') {
              console.error(`Invalid product id for "${product.name}"`);
              continue;
            }

            productId = prodData.id;
            productMap.set(product.name, productId);
            inserted.products++;

            const { error: invError } = await supabase
              .from('inventory')
              .upsert(
                { product_id: productId, quantity: product.stock },
                { onConflict: 'product_id', ignoreDuplicates: true }
              );

            if (invError) {
              console.error(`Error inserting inventory for "${product.name}":`, invError);
            } else {
              inserted.inventory++;
            }
          }
        }
      }
    }

    console.log(
      `Database seeding completed. Categories: ${inserted.categories}, Subcategories: ${inserted.subcategories}, Products: ${inserted.products}, Inventory: ${inserted.inventory}`
    );
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
    return { success: false, error: String(error) };
  }
}
