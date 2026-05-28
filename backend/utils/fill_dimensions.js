const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Prompt = require('../models/Prompt');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const getPublicIdFromUrl = (url) => {
  const match = url.match(/\/image\/upload\/v\d+\/(.+)\.[a-z]+$/i);
  return match ? match[1] : null;
};

async function main() {
  const url = process.env.MONGODB_URL;
  const dbName = process.env.DATABASE_NAME || 'promptova';
  console.log('Connecting to database...');
  await mongoose.connect(url, { dbName });
  console.log('Connected!');

  const prompts = await Prompt.find({
    $or: [
      { width: { $exists: false } },
      { height: { $exists: false } },
      { width: null },
      { height: null }
    ]
  });

  console.log(`Found ${prompts.length} prompts needing width/height updates.`);

  let successCount = 0;
  let failCount = 0;

  for (const prompt of prompts) {
    if (!prompt.imageUrl) {
      console.log(`Skipping prompt ${prompt._id} (${prompt.title}) - no imageUrl`);
      continue;
    }

    const publicId = getPublicIdFromUrl(prompt.imageUrl);
    if (!publicId) {
      console.log(`Could not extract public ID for prompt ${prompt._id} (${prompt.title}): ${prompt.imageUrl}`);
      continue;
    }

    try {
      console.log(`Fetching dimensions from Cloudinary for: ${prompt.title} (${publicId})`);
      const res = await cloudinary.api.resource(publicId);
      
      prompt.width = res.width;
      prompt.height = res.height;
      await prompt.save();
      
      console.log(`✅ Updated ${prompt.title}: ${res.width}x${res.height}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to update ${prompt.title}:`, err.message);
      failCount++;
    }
  }

  console.log(`Migration finished. Success: ${successCount}, Failures: ${failCount}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
