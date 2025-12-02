// src/routes/consultaRoutes.js
import { Router } from 'express';
import ConsultaController from '../controllers/ConsultaController.js';

const router = new Router();

// paciente agenda consulta
router.post('/', ConsultaController.store);

// lista todas as consultas (você pode depois filtrar por role)
router.get('/', ConsultaController.index);

// médico / biomédico altera status (aceitar, recusar, concluir)
router.patch('/:id', ConsultaController.update);

// paciente cancela consulta
router.delete('/:id', ConsultaController.cancel);

export default router;
