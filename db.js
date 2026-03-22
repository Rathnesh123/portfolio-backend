const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const loadData = (file, defaults) => {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    return defaults;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return defaults;
  }
};

const saveData = (file, data) => {
  const filePath = path.join(DATA_DIR, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { loadData, saveData };
