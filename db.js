import { Pool } from 'pg';
import 'dotenv/config';

// O Neon (assim como a Vercel) fornece uma POSTGRES_URL.
// O 'pg' module sabe como usar essa string.
// Esta configuração é para o Neon (sem objeto SSL).
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Função para criar as tabelas se elas não existirem
const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS person (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20),
      linkedin_url VARCHAR(255),
      github_url VARCHAR(255),
      summary TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS experience (
      id SERIAL PRIMARY KEY,
      person_id INTEGER NOT NULL REFERENCES person(id) ON DELETE CASCADE,
      job_title VARCHAR(100) NOT NULL,
      company VARCHAR(100) NOT NULL,
      start_date DATE,
      end_date DATE,
      description TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS education (
      id SERIAL PRIMARY KEY,
      person_id INTEGER NOT NULL REFERENCES person(id) ON DELETE CASCADE,
      institution VARCHAR(100) NOT NULL,
      degree VARCHAR(100) NOT NULL,
      field_of_study VARCHAR(100),
      start_date DATE,
      end_date DATE
    );`,
    `CREATE TABLE IF NOT EXISTS skill (
      id SERIAL PRIMARY KEY,
      person_id INTEGER NOT NULL REFERENCES person(id) ON DELETE CASCADE,
      skill_name VARCHAR(50) NOT NULL,
      level VARCHAR(20) 
    );`
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log("Tabelas verificadas/criadas com sucesso.");
  } catch (err) {
    console.error("Erro ao criar tabelas:", err);
  }
};

// Função para popular o banco com os dois currículos (OBS 1)
const seedDatabase = async () => {
  try {
    // 1. Verifica se já existem pessoas no banco
    const { rows } = await pool.query('SELECT COUNT(*) FROM person');
    const count = parseInt(rows[0].count, 10);

    if (count === 0) {
      console.log('Banco de dados vazio, inserindo dados iniciais...');
      
      // --- Pessoa 1: João Silva ---
      const { rows: [pessoa1] } = await pool.query(
        `INSERT INTO person (name, email, phone, linkedin_url, github_url, summary)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          'João Silva',
          'joao.silva@email.com',
          '+55 (11) 98765-4321',
          'https://linkedin.com/in/joaosilva',
          'https://github.com/joaosilva',
          'Desenvolvedor de software sênior com 8 anos de experiência em Node.js e React.'
        ]
      );

      // Experiências do João
      await pool.query(
        `INSERT INTO experience (person_id, job_title, company, start_date, end_date, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pessoa1.id, 'Engenheiro de Software Sênior', 'Tech Solutions', '2020-01-15', null, 'Liderança de equipe e desenvolvimento de APIs RESTful.']
      );

      // Educação do João
      await pool.query(
        `INSERT INTO education (person_id, institution, degree, field_of_study, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pessoa1.id, 'Universidade de São Paulo (USP)', 'Bacharelado', 'Ciência da Computação', '2012-02-01', '2016-12-15']
      );

      // Skills do João
      await pool.query(
        `INSERT INTO skill (person_id, skill_name, level)
         VALUES ($1, $2, $3), ($1, $4, $5), ($1, $6, $7)`,
        [pessoa1.id, 'Node.js', 'Avançado', 'React', 'Avançado', 'PostgreSQL', 'Intermediário']
      );
      
      // --- Pessoa 2: Maria Oliveira ---
      const { rows: [pessoa2] } = await pool.query(
        `INSERT INTO person (name, email, phone, linkedin_url, github_url, summary)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          'Maria Oliveira',
          'maria.oliveira@email.com',
          '+55 (21) 91234-5678',
          'https://linkedin.com/in/mariaoliveira',
          'https://github.com/mariaoliveira',
          'Designer de UX/UI com foco em aplicações móveis e web. Apaixonada por criar interfaces intuitivas.'
        ]
      );

      // Experiências da Maria
      await pool.query(
        `INSERT INTO experience (person_id, job_title, company, start_date, end_date, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pessoa2.id, 'UX/UI Designer Pleno', 'DesignCo', '2019-03-01', '2022-05-30', 'Pesquisa de usuário, prototipação e testes de usabilidade.']
      );

      // Educação da Maria
      await pool.query(
        `INSERT INTO education (person_id, institution, degree, field_of_study, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pessoa2.id, 'Universidade Federal do Rio de Janeiro (UFRJ)', 'Bacharelado', 'Design Gráfico', '2015-03-01', '2019-01-20']
      );

      // Skills da Maria
      await pool.query(
        `INSERT INTO skill (person_id, skill_name, level)
         VALUES ($1, $2, $3), ($1, $4, $5), ($1, $6, $7)`,
        [pessoa2.id, 'Figma', 'Avançado', 'Adobe XD', 'Avançado', 'HTML/CSS', 'Intermediário']
      );
      
      console.log('Dados iniciais inseridos com sucesso.');
    } else {
      console.log('O banco de dados já contém dados. Seed não executado.');
    }
  } catch (err) {
    console.error('Erro ao popular o banco de dados:', err);
  }
};

// Função de inicialização que chama a criação e o seed
const initializeDatabase = async () => {
  try {
    await createTables();
    await seedDatabase();
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  }
};

export { pool, initializeDatabase };