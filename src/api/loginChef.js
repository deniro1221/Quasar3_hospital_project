import { getConnection } from './db.js'
import { Router } from 'express'

const router = Router()

router.post('/', async (req, res) => {
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
      const idKuhara = kuhar.ID_kuhara || null

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

// eksportaj router da ga uključiš u glavni server na portu 3000
export default router
