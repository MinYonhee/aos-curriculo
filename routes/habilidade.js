import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// ===================================
// CRUD - SKILL (Habilidade)
// ===================================

// UPDATE
router.put('/skill/:id', async (req, res) => {
  const { id } = req.params;
  const { skill_name, level } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE skill SET skill_name = $1, level = $2 WHERE id = $3 RETURNING *`,
      [skill_name, level, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Habilidade não encontrada.' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/skill/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM skill WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Habilidade não encontrada.' });
    }
    res.status(200).json({ message: 'Habilidade deletada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;