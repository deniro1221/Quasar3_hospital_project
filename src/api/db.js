import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config() // Učitaj varijable iz .env

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
