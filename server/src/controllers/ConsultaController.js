import Consulta from '../models/Consulta.js';

class ConsultaController {
  // paciente agenda
  async store(req, res) {
    try {
      const consulta = await Consulta.create({
        data: req.body.data,
        hora: req.body.hora,
        paciente_nome: req.body.pacienteNome,
        paciente_email: req.body.pacienteEmail,
      });

      return res.json(consulta);
    } catch (err) {
      return res.status(400).json({
        errors: ['Erro ao criar consulta'],
      });
    }
  }

  // listar consultas (todos)
  async index(req, res) {
    const consultas = await Consulta.findAll();
    return res.json(consultas);
  }

  // médico decide
  async update(req, res) {
    const consulta = await Consulta.findByPk(req.params.id);
    if (!consulta) {
      return res.status(404).json({ errors: ['Consulta não encontrada'] });
    }

    await consulta.update(req.body);
    return res.json(consulta);
  }

  // paciente cancela
  async cancel(req, res) {
    const consulta = await Consulta.findByPk(req.params.id);
    if (!consulta) {
      return res.status(404).json({ errors: ['Consulta não encontrada'] });
    }

    if (consulta.status !== 'pendente') {
      return res
        .status(400)
        .json({ errors: ['Consulta não pode mais ser cancelada'] });
    }

    await consulta.update({ status: 'cancelada' });
    return res.json(consulta);
  }
}

export default new ConsultaController();
