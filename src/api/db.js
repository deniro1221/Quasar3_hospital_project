import mysql from 'mysql2/promise'

const config = {
  host: 'localhost',
  user: 'root',
  password: 'AAbb121cE23opi',
  port: 3306,
  database: 'thalassock',
}

export const getConnection = async () => {
  const connection = await mysql.createConnection(config)
  return connection
}
