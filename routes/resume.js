const express = require('express');
const verifyToken = require('../middleware/auth');
const { loadData, saveData } = require('../db');
const router = express.Router();

const FILE = 'resume.json';
const DEFAULTS = { _id: '1', url: '', fileName: 'Rathnesh_Resume.pdf', updatedAt: new Date().toISOString() };

let resumeData = loadData(FILE, DEFAULTS);

router.get('/', (req, res) => { res.json({ success: true, data: resumeData }); });
router.put('/', verifyToken, (req, res) => {
  const { url, fileName } = req.body;
  if (!url) return res.status(400).json({ message: 'Resume URL is required' });
  resumeData = { ...resumeData, url, fileName: fileName || resumeData.fileName, updatedAt: new Date().toISOString() };
  saveData(FILE, resumeData);
  res.json({ success: true, data: resumeData });
});

module.exports = router;
