require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { seedDatabase } = require('./seedData');

async function seed() {
  await connectDB();
  console.log('Seeding database...');
  const result = await seedDatabase({ clear: true });
  if (!result.skipped) {
    console.log(`Seed completed! Users: ${result.users}, Letters: ${result.letters}`);
  }
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
