import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { getConnection } from './db.js' // Ispravna putanja do db.js

const app = express()
const port = 3006

app.use(cors())
app.use(bodyParser.json())

// API ruta za prijavu sestre
app.post('/login_nurse', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Korisničko ime i lozinka su obavezni.' })
  }

  try {
    const connection = await getConnection()
    const sql = 'SELECT * FROM sestra WHERE username = ? AND lozinka = ?'
    const [results] = await connection.execute(sql, [username, password])

    if (results.length > 0) {
      const sestra = results[0]
      // Pretpostavljena kolona ID_sestra (ili slično)
      const idSestre = sestra.ID_sestre || null

      // Pošalji rezultat s ID-em sestra
      return res.status(200).json({
        message: 'Prijava uspješna!',
        ID_sestre: idSestre,
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
