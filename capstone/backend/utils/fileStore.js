const fs = require('fs');
const path = require('path');

// Ensure directory exists before writing
const ensureDir = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Load JSON data from file, return defaultValue if missing or invalid
const loadJson = (filePath, defaultValue) => {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (raw.trim().length) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.error(`Failed to load ${filePath}:`, err);
  }
  return defaultValue;
};

// Save JSON data to file (pretty printed)
const saveJson = (filePath, data) => {
  try {
    ensureDir(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Failed to save ${filePath}:`, err);
  }
};

module.exports = { ensureDir, loadJson, saveJson };
