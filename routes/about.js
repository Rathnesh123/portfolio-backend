const express = require('express');
const verifyToken = require('../middleware/auth');
const { loadData, saveData } = require('../db');
const router = express.Router();

const FILE = 'about.json';
const DEFAULTS = { _id: '1', heading: 'About Me', bio1: '', bio2: '', location: 'India', degree: 'B.Tech CSE', focus: 'Data & AI', passion: 'Problem Solving', photoUrl: '' };

let aboutData = loadData(FILE, DEFAULTS);

router.get('/', (req, res) => { res.json({ success: true, data: aboutData }); });

router.put('/', verifyToken, (req, res) => {
  const allowed = ['heading', 'bio1', 'bio2', 'location', 'degree', 'focus', 'passion', 'photoUrl'];
  allowed.forEach(key => { if (req.body[key] !== undefined) aboutData[key] = req.body[key]; });
  saveData(FILE, aboutData);
  res.json({ success: true, data: aboutData });
});

router.post('/photo', verifyToken, (req, res) => {
  const { photo } = req.body;
  if (photo === undefined) return res.status(400).json({ message: 'No photo provided' });
  aboutData.photoUrl = photo;
  saveData(FILE, aboutData);
  res.json({ success: true, data: { photoUrl: aboutData.photoUrl } });
});

module.exports = router;
