import type { DashboardState } from '../store/dashboardStore';

export interface MongoHealthResponse {
  status: 'connected' | 'disconnected';
  readyState: number;
  dbConnected: boolean;
  mongoUriMasked?: string;
  error?: string | null;
}

export const checkMongoHealth = async (): Promise<MongoHealthResponse> => {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      return { status: 'disconnected', readyState: 0, dbConnected: false, error: 'Server unreachable' };
    }
    return await res.json();
  } catch (err: any) {
    return { status: 'disconnected', readyState: 0, dbConnected: false, error: err.message };
  }
};

export const fetchStateFromMongo = async (): Promise<DashboardState | null> => {
  try {
    const res = await fetch('/api/dashboard');
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch (err) {
    console.warn('Could not fetch state from MongoDB Atlas server:', err);
    return null;
  }
};

export const syncStateToMongo = async (state: DashboardState): Promise<{ success: boolean; updatedAt?: string; error?: string }> => {
  try {
    const res = await fetch('/api/dashboard/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || 'Sync request failed' };
    }
    const data = await res.json();
    return { success: true, updatedAt: data.updatedAt };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const updateMongoUri = async (mongoUri: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch('/api/db-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mongoUri })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to connect to MongoDB Atlas' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
