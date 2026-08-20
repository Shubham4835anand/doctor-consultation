const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

/**
 * Reads the mock database from db.json.
 * If file does not exist, returns empty default structure.
 */
function readData() {
  try {
    if (!fs.existsSync(dbPath)) {
      const defaultDb = { users: [], doctors: [], appointments: [] };
      fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2), 'utf8');
      return defaultDb;
    }
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { users: [], doctors: [], appointments: [] };
  }
}

/**
 * Writes data back to db.json.
 */
function writeData(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to db.json:', error);
    return false;
  }
}

module.exports = {
  readData,
  writeData
};
