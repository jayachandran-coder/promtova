const Prompt = require('../models/Prompt');

/**
 * Self-healing DB migration to convert category (string) to categories (array of strings)
 * and update old categories to the new category system.
 */
const runMigration = async () => {
  try {
    console.log('🔄 Checking if prompt category database migration is needed...');
    const promptsToMigrate = await Prompt.find({
      $or: [
        { categories: { $exists: false } },
        { categories: { $size: 0 } }
      ]
    });

    if (promptsToMigrate.length > 0) {
      console.log(`📊 Found ${promptsToMigrate.length} prompts requiring category array migration.`);
      let migratedCount = 0;

      for (const prompt of promptsToMigrate) {
        let cats = [];
        if (prompt.category) {
          cats = [prompt.category];
        } else if (prompt.categories && prompt.categories.length > 0) {
          cats = prompt.categories;
        } else {
          cats = ['Cinematic']; // safe fallback
        }

        // Map legacy category names to new curated category names
        cats = cats.map(cat => {
          const trimmed = cat.trim();
          if (trimmed === 'Portrait') return 'Girls';
          if (trimmed === 'Product' || trimmed === 'Product Photography') return 'Fashion';
          if (trimmed === 'Architecture') return 'Cinematic';
          if (trimmed === 'Fantasy') return 'Fantasy'; // ensure correct spelling
          return trimmed;
        });

        // Ensure unique, non-empty categories
        cats = [...new Set(cats)].filter(Boolean);
        if (cats.length === 0) {
          cats = ['Cinematic'];
        }

        prompt.categories = cats;
        // Maintain legacy field for safe fallbacks
        prompt.category = cats[0];

        // Explicitly tell mongoose categories changed (since array updates in mixed schemas sometimes require it)
        prompt.markModified('categories');
        prompt.markModified('category');

        await prompt.save();
        migratedCount++;
      }

      console.log(`✅ Database migration completed. Successfully migrated ${migratedCount} prompts.`);
    } else {
      console.log('✅ Database categories migration: All prompts are already up-to-date.');
    }
  } catch (error) {
    console.error('❌ Error during prompt category database migration:', error);
  }
};

module.exports = runMigration;
