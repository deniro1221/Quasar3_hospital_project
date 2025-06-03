import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { getConnection } from './db.js' // Ispravna putanja do db.js

const app = express()
const port = 3008

app.use(cors())
app.use(bodyParser.json())

// API ruta za prijavu
app.post('/login_chef', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Korisničko ime i lozinka su obavezni.' })
  }

  try {
    const connection = await getConnection()
    const sql = 'SELECT * FROM kuhar WHERE username = ? AND lozinka = ?'
    const [results] = await connection.execute(sql, [username, password])

    if (results.length > 0) {
      const kuhar = results[0]
      // Pretpostavljam da je ID_kuhara kolona u tablici
      const idKuhara = kuhar.ID_kuhara || null

      // Pošaljite rezultat, uključujući ID_kuhara
      return res.status(200).json({
        message: 'Prijava uspješna!',
        ID_kuhara: idKuhara,
      })
    } else {
      return res.status(401).json({ message: 'Pogrešno korisničko ime ili lozinka.' })
    }
  } catch (error) {
    console.error('Greška prilikom izvođenja upita:', error)
    return res.status(500).json({ message: 'Greška na serveru.' })
  }
})
// Pokrenite server
app.listen(port, () => {
  console.log(`Server je pokrenut na http://localhost:${port}`)
})
