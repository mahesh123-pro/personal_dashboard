import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fallback DNS servers for Windows dev environment
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    console.warn('DNS server override notice:', e.message);
  }
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const defaultMongoUri = 'mongodb+srv://supermayu017_db_user:p0QXzmdPjfTFDP44@personaldashboard.p1cd2qf.mongodb.net/personalDashboard?retryWrites=true&w=majority&appName=personalDashboard';

function getMongoUri() {
  return process.env.MONGODB_URI || defaultMongoUri;
}

// Hardened Security Configuration
app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
let cachedPromise = null;

// Connect to MongoDB Atlas
async function connectToMongo(uri) {
  if (mongoose.connection.readyState === 1) {
    isDbConnected = true;
    dbError = null;
    return;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    }).then(() => {
      isDbConnected = true;
      dbError = null;
      console.log('✅ Successfully connected to MongoDB Atlas Cluster!');
    }).catch((err) => {
      isDbConnected = false;
      dbError = err.message;
      cachedPromise = null;
      console.error('❌ MongoDB Connection Failure:', err.message);
      throw err;
    });
  }

  await cachedPromise;
}

// Initial Connection attempt
connectToMongo(getMongoUri()).catch(() => {});

// API 1: Health & Connection Status (Awaits connection for serverless Vercel accuracy)
app.get('/api/health', async (req, res) => {
  try {
    await connectToMongo(getMongoUri());
    res.json({
      status: 'connected',
      readyState: mongoose.connection.readyState,
      dbConnected: true,
      error: null
    });
  } catch (err) {
    res.json({
      status: 'disconnected',
      readyState: mongoose.connection.readyState,
      dbConnected: false,
      error: err?.message || 'Database connection error'
    });
  }
});

// API 2: Fetch State from MongoDB Atlas
app.get('/api/dashboard', async (req, res) => {
  try {
    await connectToMongo(getMongoUri());
    let doc = await DashboardModel.findOne({ userId: 'default_user' });
    if (!doc) {
      return res.json({ state: null, message: 'No remote document yet' });
    }
    res.json({ state: doc.state, updatedAt: doc.updatedAt });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to retrieve remote state', dbConnected: false });
  }
});

// API 3: Sync & Save State to MongoDB Atlas
app.post('/api/dashboard/sync', async (req, res) => {
  try {
    const { state } = req.body;
    if (!state) {
      return res.status(400).json({ error: 'Missing state payload' });
    }

    await connectToMongo(getMongoUri());

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
    res.status(500).json({ error: err?.message || 'Failed to synchronize state', dbConnected: false });
  }
});

// Start Express Server (only if not running in Vercel serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Personal OS Backend Server running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel serverless functions
export default app;
