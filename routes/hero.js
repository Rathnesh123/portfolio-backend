const express = require('express');
const verifyToken = require('../middleware/auth');
const { loadData, saveData } = require('../db');
const router = express.Router();

const FILE = 'hero.json';
const DEFAULTS = {
  _id: '1',
  firstName: 'Mena',
  lastName: 'Rathnesh',
  badgeText: 'B.Tech CSE @ LPU',
  typingStrings: ['Full-Stack Developer', 'React.js Enthusiast', 'Problem Solver', 'Data Analyst', 'AI App Builder'],
  description: 'Computer Science Engineering student passionate about Data Analytics, Web Development, and AI-based applications.',
  linkedin: 'https://linkedin.com/in/rathnesh06',
  github: 'https://github.com/Rathnesh12',
  email: 'rathnesh.bunty@gmail.com',
};

let heroData = loadData(FILE, DEFAULTS);

router.get('/', (req, res) => { res.json({ success: true, data: heroData }); });

router.put('/', verifyToken, (req, res) => {
  const allowed = ['firstName', 'lastName', 'badgeText', 'typingStrings', 'description', 'linkedin', 'github', 'email'];
  allowed.forEach(key => { if (req.body[key] !== undefined) heroData[key] = req.body[key]; });
  saveData(FILE, heroData);
  res.json({ success: true, data: heroData });
});

module.exports = router;
