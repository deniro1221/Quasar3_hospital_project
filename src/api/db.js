import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config()

// TEST - provjeri je li učitalo:
console.log('DB_HOST:', process.env.DB_HOST)

const config = {
  host: 'mysql-thalassock.alwaysdata.net',
  port: 3306,
  user: '417243',
  password: 'Selce#2025',
  database: 'thalassock_1221',
}
console.log('Kreirana konfiguracija:', config)
export const getConnection = async () => {
  const connection = await mysql.createConnection(config)
  return connection
}

//change fix
