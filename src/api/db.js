import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config({ path: 'C:\\thalasso_projekt\\quasar-project\\.env' })

// Provjera učitanih varijabli
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_PORT:', process.env.DB_PORT)
console.log('DB_USER:', process.env.DB_USER)
console.log('DB_PASS:', process.env.DB_PASS)
console.log('DB_NAME:', process.env.DB_NAME)

// Konfiguracija
const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10), // osigurajte da je broj
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
}

console.log('Kreirana konfiguracija:', config)

export const getConnection = async () => {
  try {
    const connection = await mysql.createConnection(config)
    console.log('Uspješno povezan na bazu')
    return connection
  } catch (error) {
    console.error('Greška pri povezivanju na bazu:', error)
    throw error
  }
}
//fix .env
