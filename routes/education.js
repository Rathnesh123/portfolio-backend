const express = require('express');
const verifyToken = require('../middleware/auth');
const { loadData, saveData } = require('../db');
const router = express.Router();

const FILE = 'education.json';
const DEFAULTS = [];

let education = loadData(FILE, DEFAULTS);

router.get('/', (req, res) => { res.json({ success: true, data: education.sort((a, b) => a.order - b.order) }); });
router.get('/:id', (req, res) => {
  const edu = education.find(e => e._id === req.params.id);
  if (!edu) return res.status(404).json({ message: 'Education entry not found' });
  res.json({ success: true, data: edu });
});
router.post('/', verifyToken, (req, res) => {
  const { degree, institution, location, startYear, endYear, grade, description, order } = req.body;
  if (!degree || !institution) return res.status(400).json({ message: 'Degree and institution required' });
  const newEdu = { _id: Date.now().toString(), degree, institution, location: location || '', startYear: startYear || '', endYear: endYear || '', grade: grade || '', description: description || '', order: order || education.length + 1 };
  education.push(newEdu);
  saveData(FILE, education);
  res.status(201).json({ success: true, data: newEdu });
});
router.put('/:id', verifyToken, (req, res) => {
  const idx = education.findIndex(e => e._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Education entry not found' });
  education[idx] = { ...education[idx], ...req.body };
  saveData(FILE, education);
  res.json({ success: true, data: education[idx] });
});
router.delete('/:id', verifyToken, (req, res) => {
  const idx = education.findIndex(e => e._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Education entry not found' });
  education.splice(idx, 1);
  saveData(FILE, education);
  res.json({ success: true, message: 'Education entry deleted' });
});

module.exports = router;
