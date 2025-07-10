import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config({ path: 'C:\\thalasso_projekt\\quasar-project\\.env' })

// Učitavanje varijabli i konfiguracija
const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 40, // Broj istovremenih veza u poolu
}

/* Kreiranje pool-a */
const pool = mysql.createPool(config)

export const getConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('Uspješno dohvaćena veza iz poola')
    return connection
  } catch (error) {
    console.error('Greška pri dohvaćanju veze:', error)
    throw error
  }
}

// ako želiš, eksportiraj i pool direktno ako želiš koristiti pool funkcije
export default pool
