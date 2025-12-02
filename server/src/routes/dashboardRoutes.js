// src/routes/dashboardRoutes.js
import { Router } from 'express';
import DashboardController from '../controllers/DashboardController.js';
// import loginRequired from '../middlewares/loginRequired.js'; // Descomentar para proteger a rota

const router = new Router();

// Rota para o dashboard de médicos/biomédicos
router.get('/', DashboardController.index);

export default router;
