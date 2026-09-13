import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
let currentMongoUri = process.env.MONGODB_URI || 'mongodb+srv://admin:p0QXzmdPjfTFDP44@personaldashboard.p1cd2qf.mongodb.net/personalDashboard?retryWrites=true&w=majority';

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Mongoose Schema for Dashboard State
const dashboardSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'default_user', unique: true },
    state: { type: Object, required: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const DashboardModel = mongoose.model('DashboardState', dashboardSchema);

let isDbConnected = false;
let dbError = null;

// Connect to MongoDB Atlas
async function connectToMongo(uri) {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    isDbConnected = true;
    dbError = null;
    currentMongoUri = uri;
    console.log('✅ Successfully connected to MongoDB Atlas Cluster!');
  } catch (err) {
    isDbConnected = false;
    dbError = err.message;
    console.error('❌ MongoDB Connection Failure:', err.message);
  }
}

// Initial Connection
connectToMongo(currentMongoUri);

// API 1: Health & Connection Status
app.get('/api/health', (req, res) => {
  const connectionState = mongoose.connection.readyState;
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  res.json({
    status: isDbConnected ? 'connected' : 'disconnected',
    readyState: connectionState,
    dbConnected: isDbConnected,
    mongoUriMasked: currentMongoUri.replace(/:([^@]+)@/, ':****@'),
    error: dbError
  });
});

// API 2: Fetch State from MongoDB Atlas
app.get('/api/dashboard', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.status(503).json({ error: 'MongoDB Atlas disconnected', dbConnected: false });
    }
    let doc = await DashboardModel.findOne({ userId: 'default_user' });
    if (!doc) {
      return res.json({ state: null, message: 'No remote document yet' });
    }
    res.json({ state: doc.state, updatedAt: doc.updatedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 3: Sync & Save State to MongoDB Atlas
app.post('/api/dashboard/sync', async (req, res) => {
  try {
    const { state } = req.body;
    if (!state) {
      return res.status(400).json({ error: 'Missing state payload' });
    }
    if (!isDbConnected) {
      return res.status(503).json({ error: 'MongoDB Atlas is not connected', dbConnected: false });
    }

    const doc = await DashboardModel.findOneAndUpdate(
      { userId: 'default_user' },
      { state, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      updatedAt: doc.updatedAt,
      message: 'State synchronized with MongoDB Atlas cloud successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 4: Dynamically Update & Re-connect MongoDB URI
app.post('/api/db-config', async (req, res) => {
  try {
    const { mongoUri } = req.body;
    if (!mongoUri) {
      return res.status(400).json({ error: 'Missing mongoUri parameter' });
    }
    await connectToMongo(mongoUri);
    if (isDbConnected) {
      res.json({ success: true, message: 'Connected to MongoDB Atlas successfully!' });
    } else {
      res.status(400).json({ success: false, error: dbError });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Personal OS Backend Server running on http://localhost:${PORT}`);
});
