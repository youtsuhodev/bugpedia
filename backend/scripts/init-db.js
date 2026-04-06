/**
 * Initialise la base MySQL Bugpedia à partir de sql/schema.mysql.sql
 *
 * Usage (depuis backend/) :
 *   node scripts/init-db.js
 *   node scripts/init-db.js --force   # supprime les tables puis recrée (dev uniquement)
 *
 * Variables lues depuis backend/.env (ou déjà présentes dans l’environnement) :
 *   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const BACKEND_ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(BACKEND_ROOT, '.env');
const SCHEMA_PATH = path.join(BACKEND_ROOT, 'sql', 'schema.mysql.sql');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) {
      continue;
    }
    const i = t.indexOf('=');
    if (i === -1) {
      continue;
    }
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function applyDatabaseName(sql, dbName) {
  if (!dbName || dbName === 'bugpedia') {
    return sql;
  }
  return sql
    .replace(
      /CREATE DATABASE IF NOT EXISTS bugpedia/gi,
      `CREATE DATABASE IF NOT EXISTS \`${dbName.replace(/`/g, '')}\``,
    )
    .replace(/USE bugpedia;/gi, `USE \`${dbName.replace(/`/g, '')}\`;`);
}

async function dropAllTables(conn, dbName) {
  await conn.query(`USE \`${dbName.replace(/`/g, '')}\``);
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  const tables = [
    'votes',
    'solutions',
    'bug_relations',
    'bugs',
    'library_versions',
    'users',
  ];
  for (const t of tables) {
    await conn.query(`DROP TABLE IF EXISTS \`${t}\``);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log(`Tables supprimées dans \`${dbName}\` (--force).`);
}

async function main() {
  loadDotEnv(ENV_PATH);

  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD ?? '';
  const database = (process.env.MYSQL_DATABASE || 'bugpedia').replace(/`/g, '');
  const force = process.argv.includes('--force');

  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`Fichier schéma introuvable : ${SCHEMA_PATH}`);
    process.exit(1);
  }

  let sql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  sql = applyDatabaseName(sql, database);

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });

  try {
    if (force) {
      await conn.query(
        `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      await dropAllTables(conn, database);
    }

    console.log(`Exécution du schéma (host=${host}, db=${database})…`);
    await conn.query(sql);
    console.log('Base MySQL Bugpedia initialisée avec succès.');
  } catch (err) {
    console.error('Erreur MySQL :', err.code || err.errno, err.message);
    if (err.sqlMessage) {
      console.error('SQL :', err.sqlMessage);
    }
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
