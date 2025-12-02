// src/routes/tokenRoutes.js
import { Router } from 'express';
import tokenController from '../controllers/TokenController.js';

const router = new Router();

// Login – gera token JWT
router.post('/', tokenController.store);

export default router;