import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('neurowardrobe.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gender TEXT,
    age INTEGER,
    height REAL,
    style_preference TEXT,
    budget_preference TEXT,
    location TEXT,
    latitude REAL,
    longitude REAL,
    city TEXT,
    analysis_results TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wardrobe_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT,
    subcategory TEXT,
    brand TEXT,
    purchase_date TEXT,
    price REAL,
    primary_color TEXT,
    secondary_colors TEXT,
    shade_intensity TEXT,
    pattern_type TEXT,
    pattern_scale TEXT,
    fabric_type TEXT,
    fabric_weight TEXT,
    stretch_level TEXT,
    fit_type TEXT,
    structure_level TEXT,
    season TEXT,
    breathability_score INTEGER,
    layer_compatibility INTEGER,
    image_url TEXT,
    tags TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS outfits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT,
    items TEXT,
    occasion TEXT,
    weather_context TEXT,
    explanation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Migration: Add missing columns if table already existed
const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
const columns = tableInfo.map(c => c.name);

const migrations = [
  { name: 'gender', type: 'TEXT' },
  { name: 'age', type: 'INTEGER' },
  { name: 'height', type: 'REAL' },
  { name: 'style_preference', type: 'TEXT' },
  { name: 'budget_preference', type: 'TEXT' },
  { name: 'location', type: 'TEXT' },
  { name: 'latitude', type: 'REAL' },
  { name: 'longitude', type: 'REAL' },
  { name: 'city', type: 'TEXT' },
  { name: 'analysis_results', type: 'TEXT' }
];

migrations.forEach(m => {
  if (!columns.includes(m.name)) {
    try {
      db.exec(`ALTER TABLE users ADD COLUMN ${m.name} ${m.type}`);
    } catch (e) {
      console.warn(`Migration failed for column ${m.name}:`, e);
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  // Auth Routes
  app.post('/api/auth/signup', async (req, res) => {
    const { full_name, email, password, gender, age, height, style_preference, budget_preference, location, latitude, longitude, city } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare(`
        INSERT INTO users (
          full_name, email, password, gender, age, height, 
          style_preference, budget_preference, location, latitude, longitude, city
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        full_name, email, hashedPassword, gender, age, height, 
        style_preference, budget_preference, location, latitude, longitude, city
      );
      res.json({ success: true, userId: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...userWithoutPassword } = user;
      if (userWithoutPassword.analysis_results) {
        try {
          userWithoutPassword.analysis_results = JSON.parse(userWithoutPassword.analysis_results);
        } catch (e) {
          userWithoutPassword.analysis_results = null;
        }
      }
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // User Profile Update
  app.post('/api/user/profile', (req, res) => {
    const { userId, full_name, gender, age, height, style_preference, budget_preference, location, latitude, longitude, city } = req.body;
    try {
      db.prepare(`
        UPDATE users SET 
          full_name = ?, gender = ?, age = ?, height = ?, 
          style_preference = ?, budget_preference = ?, 
          location = ?, latitude = ?, longitude = ?, city = ?
        WHERE id = ?
      `).run(full_name, gender, age, height, style_preference, budget_preference, location, latitude, longitude, city, userId);
      
      const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
      const { password, ...userWithoutPassword } = updatedUser;
      if (userWithoutPassword.analysis_results) {
        userWithoutPassword.analysis_results = JSON.parse(userWithoutPassword.analysis_results);
      }
      res.json({ success: true, user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // User Analysis Update
  app.post('/api/user/analysis', (req, res) => {
    const { userId, analysisResults } = req.body;
    try {
      db.prepare('UPDATE users SET analysis_results = ? WHERE id = ?').run(JSON.stringify(analysisResults), userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  app.get('/api/wardrobe/:userId', (req, res) => {
    const items = db.prepare('SELECT * FROM wardrobe_items WHERE user_id = ?').all(req.params.userId) as any[];
    const parsedItems = items.map(item => ({
      ...item,
      secondary_colors: JSON.parse(item.secondary_colors || '[]'),
      tags: JSON.parse(item.tags || '[]'),
      metadata: JSON.parse(item.metadata || '{}')
    }));
    res.json(parsedItems);
  });

  app.post('/api/wardrobe', (req, res) => {
    const { 
      user_id, category, subcategory, brand, purchase_date, price,
      primary_color, secondary_colors, shade_intensity, pattern_type, pattern_scale,
      fabric_type, fabric_weight, stretch_level, fit_type, structure_level,
      season, breathability_score, layer_compatibility, image_url, tags, metadata 
    } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO wardrobe_items (
          user_id, category, subcategory, brand, purchase_date, price,
          primary_color, secondary_colors, shade_intensity, pattern_type, pattern_scale,
          fabric_type, fabric_weight, stretch_level, fit_type, structure_level,
          season, breathability_score, layer_compatibility, image_url, tags, metadata
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        user_id, category, subcategory, brand, purchase_date, price,
        primary_color, JSON.stringify(secondary_colors), shade_intensity, pattern_type, pattern_scale,
        fabric_type, fabric_weight, stretch_level, fit_type, structure_level,
        season, breathability_score, layer_compatibility, image_url, JSON.stringify(tags), JSON.stringify(metadata)
      );
      res.json({ success: true, itemId: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Outfit Routes
  app.get('/api/outfits/:userId', (req, res) => {
    const outfits = db.prepare('SELECT * FROM outfits WHERE user_id = ?').all(req.params.userId) as any[];
    const parsedOutfits = outfits.map(outfit => ({
      ...outfit,
      items: JSON.parse(outfit.items || '[]'),
      weather_context: JSON.parse(outfit.weather_context || '{}')
    }));
    res.json(parsedOutfits);
  });

  app.post('/api/outfits', (req, res) => {
    const { user_id, name, items, occasion, weather_context, explanation } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO outfits (user_id, name, items, occasion, weather_context, explanation)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(user_id, name, JSON.stringify(items), occasion, JSON.stringify(weather_context), explanation);
      res.json({ success: true, outfitId: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Delete user analysis data
app.post('/api/user/analysis/delete', (req, res) => {
  const { userId } = req.body;
  try {
    db.prepare('UPDATE users SET analysis_results = NULL WHERE id = ?').run(userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete analysis data' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
