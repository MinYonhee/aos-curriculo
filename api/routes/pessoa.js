import { Router } from 'express';
import { pool } from '../../db.js';

const router = Router();

// ===================================
// CRUD - PERSON (Pessoa/Currículo)
// ===================================

// CREATE (Criar Pessoa)
router.post('/person', async (req, res) => {
  const { name, email, phone, linkedin_url, github_url, summary } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO person (name, email, phone, linkedin_url, github_url, summary)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, phone, linkedin_url, github_url, summary]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (Listar todas as Pessoas)
router.get('/person', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM person ORDER BY name');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (Obter uma Pessoa por ID)
router.get('/person/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM person WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada.' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (Atualizar Pessoa)
router.put('/person/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, linkedin_url, github_url, summary } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE person
       SET name = $1, email = $2, phone = $3, linkedin_url = $4, github_url = $5, summary = $6
       WHERE id = $7
       RETURNING *`,
      [name, email, phone, linkedin_url, github_url, summary, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada.' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (Deletar Pessoa)
router.delete('/person/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM person WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada.' });
    }
    res.status(200).json({ message: 'Pessoa deletada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================
// ROTA ESPECIAL: Currículo Completo
// ===================================
router.get('/person/:id/full', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Obter dados da pessoa
    const personRes = pool.query('SELECT * FROM person WHERE id = $1', [id]);
    
    // 2. Obter dados relacionados (em paralelo)
    const expRes = pool.query('SELECT * FROM experience WHERE person_id = $1 ORDER BY start_date DESC', [id]);
    const eduRes = pool.query('SELECT * FROM education WHERE person_id = $1 ORDER BY end_date DESC', [id]);
    const skillRes = pool.query('SELECT * FROM skill WHERE person_id = $1 ORDER BY skill_name', [id]);

    // 3. Aguardar todas as consultas
    const [person, experiences, educations, skills] = await Promise.all([
      personRes, expRes, eduRes, skillRes
    ]);

    if (person.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada.' });
    }

    // 4. Montar o objeto de resposta
    const fullResume = {
      ...person.rows[0],
      experiences: experiences.rows,
      educations: educations.rows,
      skills: skills.rows
    };

    res.status(200).json(fullResume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===================================
// ROTAS FILHAS (dependentes de person_id)
// ===================================

// CREATE (Adicionar Experiência para uma Pessoa)
router.post('/person/:person_id/experience', async (req, res) => {
  const { person_id } = req.params;
  const { job_title, company, start_date, end_date, description } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO experience (person_id, job_title, company, start_date, end_date, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [person_id, job_title, company, start_date, end_date, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (Listar todas as Experiências de uma Pessoa)
router.get('/person/:person_id/experience', async (req, res) => {
  const { person_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM experience WHERE person_id = $1', [person_id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE (Education)
router.post('/person/:person_id/education', async (req, res) => {
  const { person_id } = req.params;
  const { institution, degree, field_of_study, start_date, end_date } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO education (person_id, institution, degree, field_of_study, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [person_id, institution, degree, field_of_study, start_date, end_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE (Skill)
router.post('/person/:person_id/skill', async (req, res) => {
  const { person_id } = req.params;
  const { skill_name, level } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO skill (person_id, skill_name, level)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [person_id, skill_name, level]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;