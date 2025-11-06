import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// ===================================
// CRUD - EDUCATION (Educação)
// ===================================

// UPDATE
router.put('/education/:id', async (req, res) => {
  const { id } = req.params;
  const { institution, degree, field_of_study, start_date, end_date } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE education
       SET institution = $1, degree = $2, field_of_study = $3, start_date = $4, end_date = $5
       WHERE id = $6
       RETURNING *`,
      [institution, degree, field_of_study, start_date, end_date, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Educação não encontrada.' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/education/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM education WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Educação não encontrada.' });
    }
    res.status(200).json({ message: 'Educação deletada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;