const express = require('express');
const router = express.Router();
const cleanTranscript = require('../services/cleanTranscript');
const generateAdConcept = require('../services/generateAdConcept');
const generatePoster = require('../services/generatePoster');

router.post('/', async (req, res, next) => {
  try {
    const { transcript } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: 'Transcript is required.' });
    }

    console.log('⏳ Step 1/3 — Cleaning transcript...');
    const cleanedTranscript = await cleanTranscript(transcript);

    console.log('⏳ Step 2/3 — Generating ad concept...');
    const adConcept = await generateAdConcept(cleanedTranscript);

    console.log('⏳ Step 3/3 — Generating poster image...');
    const posterUrl = await generatePoster(adConcept);

    console.log('✔ Pipeline complete.');
    res.json({
      cleanedTranscript,
      adConcept,
      posterUrl,
    });
  } catch (err) {
    console.error('Pipeline error:', err.message);
    next(err);
  }
});

module.exports = router;
