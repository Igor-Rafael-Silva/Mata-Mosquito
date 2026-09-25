const express = require('express');

const router = express.Router();

const rankingController = require('../controllers/rankingController');


// GET /api/ranking
router.get(
    '/',
    rankingController.listarRanking
);


// POST /api/ranking
router.post(
    '/',
    rankingController.salvarPontuacao
);


module.exports = router;