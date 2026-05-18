const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      dbName: process.env.DATABASE_NAME || 'promptova'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ MONGODB CONNECTION ERROR DETECTED');
    console.error('='.repeat(80));
    console.error(`Original Error: ${error.message}\n`);
    
    console.error('💡 TROUBLESHOOTING GUIDE:');
    console.error('------------------------------------------------------------------------');
    console.error('1. IP WHITELIST ISSUE (Most Common for MongoDB Atlas):');
    console.error('   Your current internet connection\'s IP address is not whitelisted on');
    console.error('   your MongoDB Atlas cluster. To fix this:');
    console.error('   👉 Log in to MongoDB Atlas: https://cloud.mongodb.com/');
    console.error('   👉 Go to "Network Access" under the "Security" menu on the left.');
    console.error('   👉 Click "+ Add IP Address".');
    console.error('   👉 Click "Add Current IP Address" or add "0.0.0.0/0" to allow access');
    console.error('      from anywhere (ideal for dynamic IPs, but use with secure passwords).');
    console.error('   👉 Save changes and wait a minute for Atlas to apply the updates.');
    console.error('\n2. LOCAL MONGO FALLBACK:');
    console.error('   If you prefer to run MongoDB locally:');
    console.error('   👉 Install MongoDB Community Server locally.');
    console.error('   👉 Update your backend/.env file to:');
    console.error('      MONGODB_URL=mongodb://localhost:27017/promptova');
    console.error('\n3. FIREWALL OR VPN:');
    console.error('   👉 If you are on a public network, VPN, or behind a corporate firewall,');
    console.error('      outgoing connections to port 27017 might be blocked.');
    console.error('------------------------------------------------------------------------');
    console.error('='.repeat(80) + '\n');
    process.exit(1);
  }
};

module.exports = connectDB;

