const express = require('express');
const verifyToken = require('../middleware/auth');
const { loadData, saveData } = require('../db');
const router = express.Router();

const FILE = 'projects.json';
const DEFAULTS = [];

let projects = loadData(FILE, DEFAULTS);

router.get('/', (req, res) => { res.json({ success: true, data: projects }); });
router.get('/:id', (req, res) => {
  const project = projects.find(p => p._id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json({ success: true, data: project });
});
router.post('/', verifyToken, (req, res) => {
  const { title, description, technologies, githubUrl, liveUrl, imageUrl, featured, order } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const newProject = { _id: Date.now().toString(), title, description: description || '', technologies: technologies || [], githubUrl: githubUrl || '', liveUrl: liveUrl || '', imageUrl: imageUrl || '', featured: featured || false, order: order || projects.length + 1 };
  projects.push(newProject);
  saveData(FILE, projects);
  res.status(201).json({ success: true, data: newProject });
});
router.put('/:id', verifyToken, (req, res) => {
  const idx = projects.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Project not found' });
  projects[idx] = { ...projects[idx], ...req.body };
  saveData(FILE, projects);
  res.json({ success: true, data: projects[idx] });
});
router.delete('/:id', verifyToken, (req, res) => {
  const idx = projects.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Project not found' });
  projects.splice(idx, 1);
  saveData(FILE, projects);
  res.json({ success: true, message: 'Project deleted' });
});

module.exports = router;
