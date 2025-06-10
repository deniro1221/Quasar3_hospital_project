import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config()

console.log('DB_HOST:', process.env.DB_HOST)

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
}

console.log('Kreirana konfiguracija:', config)

export const getConnection = async () => {
  const connection = await mysql.createConnection(config)
  return connection
}
