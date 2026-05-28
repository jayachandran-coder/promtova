const mongoose = require('c:/Users/JAYACAHANDRAN/OneDrive/Desktop/promptova 2/backend/node_modules/mongoose');
const dotenv = require('c:/Users/JAYACAHANDRAN/OneDrive/Desktop/promptova 2/backend/node_modules/dotenv');

dotenv.config({ path: 'c:/Users/JAYACAHANDRAN/OneDrive/Desktop/promptova 2/backend/.env' });

const RequestSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
});

const Request = mongoose.model('Request', RequestSchema, 'requests');

async function main() {
  const url = process.env.MONGODB_URL;
  const dbName = process.env.DATABASE_NAME || 'promptova';
  await mongoose.connect(url, { dbName });
  console.log('Connected!');

  const allRequests = await Request.find({}).lean();
  console.log('Total requests:', allRequests.length);

  const missingImage = allRequests.filter(r => !r.imageUrl);
  console.log('Requests with missing imageUrl:', missingImage.length);

  const cloudinaryRequests = allRequests.filter(r => r.imageUrl && r.imageUrl.includes('cloudinary.com'));
  console.log('Requests with cloudinary.com in imageUrl:', cloudinaryRequests.length);

  const others = allRequests.filter(r => r.imageUrl && !r.imageUrl.includes('cloudinary.com'));
  console.log('Requests with other image URLs:', others.length);
  if (others.length > 0) {
    console.log('Sample of other image URLs:', others.slice(0, 5).map(o => ({ title: o.title, imageUrl: o.imageUrl })));
  }

  await mongoose.disconnect();
}

main().catch(console.error);
