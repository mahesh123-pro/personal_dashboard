import type { DashboardState } from '../store/dashboardStore';

export interface MongoHealthResponse {
  status: 'connected' | 'disconnected';
  readyState: number;
  dbConnected: boolean;
  error?: string | null;
}

const safeParseJson = async (res: Response) => {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.trim().startsWith('<!') || text.includes('<html')) {
      throw new Error('API route returned HTML page instead of JSON. Ensure Vercel serverless functions & rewrites are deployed.');
    }
    throw new Error(`Non-JSON response from server (${res.status})`);
  }
  return await res.json();
};

export const checkMongoHealth = async (): Promise<MongoHealthResponse> => {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      const data = await safeParseJson(res).catch(() => null);
      return {
        status: 'disconnected',
        readyState: 0,
        dbConnected: false,
        error: data?.error || `Server returned status ${res.status}`
      };
    }
    return await safeParseJson(res);
  } catch (err: any) {
    return {
      status: 'disconnected',
      readyState: 0,
      dbConnected: false,
      error: err.message || 'Server unreachable'
    };
  }
};

export const fetchStateFromMongo = async (): Promise<DashboardState | null> => {
  try {
    const res = await fetch('/api/dashboard');
    if (!res.ok) return null;
    const data = await safeParseJson(res);
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
      const errData = await safeParseJson(res).catch(() => null);
      return { success: false, error: errData?.error || `Sync failed with status ${res.status}` };
    }
    const data = await safeParseJson(res);
    return { success: true, updatedAt: data.updatedAt };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
