const express = require('express');
const verifyToken = require('../middleware/auth');
const { loadData, saveData } = require('../db');
const router = express.Router();

const FILE = 'skills.json';
const DEFAULTS = [];

let skills = loadData(FILE, DEFAULTS);

router.get('/', (req, res) => { res.json({ success: true, data: skills }); });
router.get('/:id', (req, res) => {
  const skill = skills.find(s => s._id === req.params.id);
  if (!skill) return res.status(404).json({ message: 'Skill not found' });
  res.json({ success: true, data: skill });
});
router.post('/', verifyToken, (req, res) => {
  const { name, category, level, icon } = req.body;
  if (!name || !category) return res.status(400).json({ message: 'Name and category required' });
  const newSkill = { _id: Date.now().toString(), name, category, level: level || 'Beginner', icon: icon || 'code' };
  skills.push(newSkill);
  saveData(FILE, skills);
  res.status(201).json({ success: true, data: newSkill });
});
router.put('/:id', verifyToken, (req, res) => {
  const idx = skills.findIndex(s => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Skill not found' });
  skills[idx] = { ...skills[idx], ...req.body };
  saveData(FILE, skills);
  res.json({ success: true, data: skills[idx] });
});
router.delete('/:id', verifyToken, (req, res) => {
  const idx = skills.findIndex(s => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Skill not found' });
  skills.splice(idx, 1);
  saveData(FILE, skills);
  res.json({ success: true, message: 'Skill deleted' });
});

module.exports = router;
