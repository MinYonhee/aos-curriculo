import { Router } from 'express';
import { pool } from '../../db.js';

const router = Router();

// ===================================
// CRUD - EXPERIENCE (Experiência)
// ===================================
// (Rotas que operam pelo ID da entidade filha)

// UPDATE (Atualizar uma Experiência específica)
router.put('/experience/:id', async (req, res) => {
  const { id } = req.params;
  const { job_title, company, start_date, end_date, description } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE experience
       SET job_title = $1, company = $2, start_date = $3, end_date = $4, description = $5
       WHERE id = $6
       RETURNING *`,
      [job_title, company, start_date, end_date, description, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Experiência não encontrada.' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (Deletar uma Experiência específica)
router.delete('/experience/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM experience WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Experiência não encontrada.' });
    }
    res.status(200).json({ message: 'Experiência deletada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;