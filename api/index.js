import dotenv from 'dotenv';
dotenv.config();

import app from '../server/index.js';

export default function handler(req, res) {
  return app(req, res);
}
