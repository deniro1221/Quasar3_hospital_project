import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { getConnection } from './db.js' // Ispravna putanja do db.js

const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.json())

// API ruta za prijavu
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  // Provjerite jesu li podaci prazni
  if (!username || !password) {
    return res.status(400).json({ message: 'Korisničko ime i lozinka su obavezni.' })
  }

  try {
    const connection = await getConnection() // Usponite konekciju
    const sql = 'SELECT * FROM admin WHERE username = ? AND lozinka = ?'

    const [results] = await connection.execute(sql, [username, password])

    if (results.length > 0) {
      return res.status(200).json({ message: 'Prijava uspješna!' })
    } else {
      return res.status(401).json({ message: 'Pogrešno korisničko ime ili lozinka.' })
    }
  } catch (error) {
    console.error('Greška prilikom izvođenja upita:', error)
    return res.status(500).json({ message: 'Greška na serveru.' })
  }
})

// Pokretanje servera
app.listen(port, () => {
  console.log(`Server je pokrenut na http://localhost:${port}`)
})
