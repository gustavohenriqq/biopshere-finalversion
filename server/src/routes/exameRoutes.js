// src/routes/exameRoutes.js
import { Router } from 'express';
import ExameController from '../controllers/ExameController.js';
// import loginRequired from '../middlewares/loginRequired.js';

const router = new Router();

// Listar todos os exames
router.get('/', ExameController.index);

// Criar novo exame (biomédico registra)
router.post('/', ExameController.store);

// Atualizar exame (status, etc.)
router.patch('/:id', ExameController.update);

// Lançar resultado do exame
router.post('/:id/resultado', ExameController.lancarResultado);

// Deletar exame
router.delete('/:id', ExameController.delete);

export default router;
