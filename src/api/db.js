import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import process from 'process'
import path from 'path'
import { fileURLToPath } from 'url'

// Ovo treba ako koristiš ES module (import/export)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Idi dvije razine gore iz `src/api` do root projekta
const envPath = path.resolve(__dirname, '../../.env')
console.log('Učitavam .env sa:', envPath)

dotenv.config({ path: envPath })

// TEST - provjeri je li učitalo:
console.log('DB_HOST:', process.env.DB_HOST)

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: 3306,
  database: process.env.DB_NAME,
}
console.log('Kreirana konfiguracija:', config)
export const getConnection = async () => {
  const connection = await mysql.createConnection(config)
  return connection
}

//change fix
