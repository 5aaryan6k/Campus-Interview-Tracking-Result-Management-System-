import express from 'express';
import Company from '../models/Company.js';

const router = express.Router();

router.get('/', async (req, res) => {
    res.json(await Company.find());
});

router.post('/', async (req, res) => {
    res.json(await Company.create(req.body));
});

export default router;
