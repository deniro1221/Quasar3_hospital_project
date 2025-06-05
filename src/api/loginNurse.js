import { Router } from 'express'
import { getConnection } from './db.js'

const router = Router()

router.post('/', async (req, res) => {
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
      const idSestre = sestra.ID_sestre || null

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

// Exportaj router da ga možeš integrirati u glavni server na portu 3000
export default router
