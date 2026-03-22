const express = require('express');
const verifyToken = require('../middleware/auth');
const { loadData, saveData } = require('../db');
const router = express.Router();

const FILE = 'certificates.json';
const DEFAULTS = [];

let certificates = loadData(FILE, DEFAULTS);

router.get('/', (req, res) => { res.json({ success: true, data: certificates.sort((a, b) => a.order - b.order) }); });
router.get('/:id', (req, res) => {
  const cert = certificates.find(c => c._id === req.params.id);
  if (!cert) return res.status(404).json({ message: 'Certificate not found' });
  res.json({ success: true, data: cert });
});
router.post('/', verifyToken, (req, res) => {
  const { title, issuer, issuedDate, credentialUrl, imageUrl, order } = req.body;
  if (!title || !issuer) return res.status(400).json({ message: 'Title and issuer required' });
  const newCert = { _id: Date.now().toString(), title, issuer, issuedDate: issuedDate || '', credentialUrl: credentialUrl || '', imageUrl: imageUrl || '', order: order || certificates.length + 1 };
  certificates.push(newCert);
  saveData(FILE, certificates);
  res.status(201).json({ success: true, data: newCert });
});
router.put('/:id', verifyToken, (req, res) => {
  const idx = certificates.findIndex(c => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Certificate not found' });
  certificates[idx] = { ...certificates[idx], ...req.body };
  saveData(FILE, certificates);
  res.json({ success: true, data: certificates[idx] });
});
router.delete('/:id', verifyToken, (req, res) => {
  const idx = certificates.findIndex(c => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Certificate not found' });
  certificates.splice(idx, 1);
  saveData(FILE, certificates);
  res.json({ success: true, message: 'Certificate deleted' });
});

module.exports = router;
