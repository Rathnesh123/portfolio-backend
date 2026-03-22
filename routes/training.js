const express = require('express');
const verifyToken = require('../middleware/auth');
const { loadData, saveData } = require('../db');
const router = express.Router();

const FILE = 'training.json';
const DEFAULTS = [];

let trainingExperience = loadData(FILE, DEFAULTS);

router.get('/', (req, res) => { res.json({ success: true, data: trainingExperience.sort((a, b) => a.order - b.order) }); });
router.get('/:id', (req, res) => {
  const item = trainingExperience.find(t => t._id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Entry not found' });
  res.json({ success: true, data: item });
});
router.post('/', verifyToken, (req, res) => {
  const { title, organization, description, startDate, endDate, type, order } = req.body;
  if (!title || !organization) return res.status(400).json({ message: 'Title and organization required' });
  const newItem = { _id: Date.now().toString(), title, organization, description: description || '', startDate: startDate || '', endDate: endDate || '', type: type || 'Training', order: order || trainingExperience.length + 1 };
  trainingExperience.push(newItem);
  saveData(FILE, trainingExperience);
  res.status(201).json({ success: true, data: newItem });
});
router.put('/:id', verifyToken, (req, res) => {
  const idx = trainingExperience.findIndex(t => t._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Entry not found' });
  trainingExperience[idx] = { ...trainingExperience[idx], ...req.body };
  saveData(FILE, trainingExperience);
  res.json({ success: true, data: trainingExperience[idx] });
});
router.delete('/:id', verifyToken, (req, res) => {
  const idx = trainingExperience.findIndex(t => t._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Entry not found' });
  trainingExperience.splice(idx, 1);
  saveData(FILE, trainingExperience);
  res.json({ success: true, message: 'Entry deleted' });
});

module.exports = router;
