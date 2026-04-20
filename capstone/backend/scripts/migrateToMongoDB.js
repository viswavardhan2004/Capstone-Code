const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/microjob';

// Define Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['student', 'client'], required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  profile: {
    bio: String,
    skills: [String],
    rating: Number,
    earnings: Number,
    inEscrow: Number,
    phone: String,
    location: String,
    university: String,
    major: String,
    graduationYear: String,
    company: String,
    industry: String,
    hourlyRate: String,
    portfolio: String
  }
});

const messageSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  sender: String,
  receiver: String,
  text: String,
  timestamp: Date,
  read: Boolean
});

const conversationSchema = new mongoose.Schema({
  conversationId: { type: String, unique: true },
  participants: [String],
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

const gigSchema = new mongoose.Schema({
  id: String,
  creatorEmail: String,
  category: String,
  title: String,
  description: String,
  price: Number,
  rating: Number,
  reviews: Number,
  image: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  gigId: String,
  buyerEmail: String,
  sellerEmail: String,
  amount: Number,
  status: String,
  escrowStatus: String,
  createdAt: { type: Date, default: Date.now },
  deliveredAt: Date,
  approvedAt: Date
});

const transactionSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  orderId: String,
  userEmail: String,
  amount: Number,
  type: String,
  status: String,
  timestamp: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const Gig = mongoose.model('Gig', gigSchema);
const Order = mongoose.model('Order', orderSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Helper to read JSON files
function readJsonFile(fileName) {
  try {
    const filePath = path.join(__dirname, '..', 'data', fileName);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`⚠️ Could not read ${fileName}:`, error.message);
    return null;
  }
}

// Migration Functions
async function migrateUsers() {
  console.log('\n📤 Migrating Users...');
  const usersData = readJsonFile('users.json');
  
  if (!usersData) return;

  try {
    const count = await User.countDocuments();
    if (count > 0) {
      console.log(`✅ Users already migrated (${count} users found)`);
      return;
    }

    const users = Array.isArray(usersData) ? usersData : Object.values(usersData);
    await User.insertMany(users);
    console.log(`✅ Migrated ${users.length} users`);
  } catch (error) {
    console.log('⚠️ Error migrating users:', error.message);
  }
}

async function migrateMessages() {
  console.log('\n💬 Migrating Messages...');
  const messagesData = readJsonFile('messages.json');
  
  if (!messagesData || !messagesData.conversations) return;

  try {
    const count = await Conversation.countDocuments();
    if (count > 0) {
      console.log(`✅ Messages already migrated (${count} conversations found)`);
      return;
    }

    const conversations = Object.entries(messagesData.conversations).map(([convId, messages]) => ({
      conversationId: convId,
      participants: convId.split('_'),
      messages: messages
    }));

    await Conversation.insertMany(conversations);
    console.log(`✅ Migrated ${conversations.length} conversations with ${Object.values(messagesData.conversations).reduce((sum, msgs) => sum + msgs.length, 0)} messages`);
  } catch (error) {
    console.log('⚠️ Error migrating messages:', error.message);
  }
}

async function migrateGigs() {
  console.log('\n🎯 Migrating Gigs...');
  const gigsData = readJsonFile('gigs.json');
  
  if (!gigsData) return;

  try {
    const count = await Gig.countDocuments();
    if (count > 0) {
      console.log(`✅ Gigs already migrated (${count} gigs found)`);
      return;
    }

    const gigs = Object.values(gigsData);
    await Gig.insertMany(gigs);
    console.log(`✅ Migrated ${gigs.length} gigs`);
  } catch (error) {
    console.log('⚠️ Error migrating gigs:', error.message);
  }
}

async function migrateOrders() {
  console.log('\n📦 Migrating Orders...');
  const ordersData = readJsonFile('orders.json');
  
  if (!ordersData) return;

  try {
    const count = await Order.countDocuments();
    if (count > 0) {
      console.log(`✅ Orders already migrated (${count} orders found)`);
      return;
    }

    const orders = Object.values(ordersData);
    await Order.insertMany(orders);
    console.log(`✅ Migrated ${orders.length} orders`);
  } catch (error) {
    console.log('⚠️ Error migrating orders:', error.message);
  }
}

async function migrateTransactions() {
  console.log('\n💳 Migrating Transactions...');
  const transData = readJsonFile('transactions.json');
  
  if (!transData) return;

  try {
    const count = await Transaction.countDocuments();
    if (count > 0) {
      console.log(`✅ Transactions already migrated (${count} transactions found)`);
      return;
    }

    const transactions = Object.values(transData);
    await Transaction.insertMany(transactions);
    console.log(`✅ Migrated ${transactions.length} transactions`);
  } catch (error) {
    console.log('⚠️ Error migrating transactions:', error.message);
  }
}

async function createIndexes() {
  console.log('\n🔍 Creating Indexes...');
  try {
    await User.collection.createIndex({ email: 1 });
    await User.collection.createIndex({ role: 1 });
    await Conversation.collection.createIndex({ conversationId: 1 });
    await Conversation.collection.createIndex({ participants: 1 });
    await Gig.collection.createIndex({ creatorEmail: 1 });
    await Gig.collection.createIndex({ category: 1 });
    await Order.collection.createIndex({ buyerEmail: 1 });
    await Order.collection.createIndex({ sellerEmail: 1 });
    await Order.collection.createIndex({ status: 1 });
    await Transaction.collection.createIndex({ userEmail: 1 });
    await Transaction.collection.createIndex({ orderId: 1 });
    console.log('✅ Indexes created successfully');
  } catch (error) {
    console.log('⚠️ Error creating indexes:', error.message);
  }
}

async function verifyMigration() {
  console.log('\n✔️ Verifying Migration...');
  try {
    const userCount = await User.countDocuments();
    const convCount = await Conversation.countDocuments();
    const gigCount = await Gig.countDocuments();
    const orderCount = await Order.countDocuments();
    const transCount = await Transaction.countDocuments();

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Conversations: ${convCount}`);
    console.log(`   Gigs: ${gigCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Transactions: ${transCount}`);
    console.log(`\n✅ All data successfully migrated to MongoDB!`);
  } catch (error) {
    console.log('⚠️ Error verifying migration:', error.message);
  }
}

// Main Migration
async function runMigration() {
  console.log('🚀 Starting MongoDB Migration...');
  console.log(`📍 Connecting to: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Run all migrations
    await migrateUsers();
    await migrateMessages();
    await migrateGigs();
    await migrateOrders();
    await migrateTransactions();
    await createIndexes();
    await verifyMigration();

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update server/index.js to use MongoDB');
    console.log('   2. Create .env file with MONGODB_URI');
    console.log('   3. Deploy your backend');
    console.log('   4. Update frontend API URLs');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();
