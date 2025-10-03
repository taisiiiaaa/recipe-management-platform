import { DataSource } from 'typeorm';
import { Category } from '../../categories/entities/categories.entity';

export const seedCategories = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(Category);

  const predefinedCategories = [
    { name: 'Main Course' },
    { name: 'Appetizers & Starters' },
    { name: 'Side Dishes' },
    { name: 'Salads' },
    { name: 'Soups & Stews' },
    { name: 'Breakfast & Brunch' },
    { name: 'Lunch' },
    { name: 'Dinner' },
    { name: 'Snacks' },
    { name: 'Desserts' },
    { name: 'Bakes Goods' },
    { name: 'Sauces & Dips' },
    { name: 'Beverages' },
    { name: 'Smoothies & Shakes' },
    { name: 'Cocktails & Drinks' },
    { name: 'Italian' },
    { name: 'French' },
    { name: 'Spanish' },
    { name: 'Mexican' },
    { name: 'Greek' },
    { name: 'Indian' },
    { name: 'Thai' },
    { name: 'Chinese' },
    { name: 'Japanese' },
    { name: 'Korean' },
    { name: 'Middle Eastern' },
    { name: 'Moroccan' },
    { name: 'American' },
    { name: 'British' },
    { name: 'Nordic / Scandinavian' },
    { name: 'Eastern European' },
    { name: 'African' },
    { name: 'Sugar-Free' },
    { name: 'High-Protein' },
    { name: 'Vegetarian' },
    { name: 'Vegan' },
    { name: 'Gluten-Free' },
    { name: 'Dairy-Free' },
    { name: 'Low-Carb / Keto' },
    { name: 'Raw Food' },
  ];

  for (const cat of predefinedCategories) {
    const existing = await categoryRepository.findOneBy({ name: cat.name });
    if (!existing) {
      await categoryRepository.save(categoryRepository.create(cat));
    }
  }
};
