import { getConnection } from './db.js'
import { Router } from 'express'
const router = Router()

// POST za unos novog menija
router.post('/menu', async (req, res) => {
  const { Datum_menija, Marenda1, Marenda2, ID_kuhara } = req.body
  let connection
  try {
    connection = await getConnection()
    await connection.execute(
      'INSERT INTO meni (Datum_menija, Marenda1, Marenda2, ID_kuhara) VALUES (?, ?, ?, ?)',
      [Datum_menija, Marenda1, Marenda2, ID_kuhara],
    )
    res.json({ message: 'Jelovnik uspješno spremljen' })
  } catch (err) {
    console.error('Greška kod unosa menija:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

// GET za provjeru menija za danas
router.get('/menu/today', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const connection = await getConnection()
    const [results] = await connection.execute(
      'SELECT DATE_FORMAT(Datum_menija, "%Y-%m-%d") AS Datum_menija, Marenda1, Marenda2 FROM meni WHERE Datum_menija = ?',
      [today],
    )
    if (results.length > 0) {
      res.json(results[0])
    } else {
      res.json(null)
    }
  } catch (err) {
    console.error('Greška kod provjere menija:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

// PUT za ažuriranje menija za danas
router.put('/menu/fresh', async (req, res) => {
  const { Datum_menija, Marenda1, Marenda2, ID_kuhara } = req.body
  if (!Datum_menija) {
    return res.status(400).json({ message: 'Datum je obavezno' })
  }
  try {
    const connection = await getConnection()
    await connection.execute(
      'UPDATE meni SET Marenda1 = ?, Marenda2 = ?, ID_kuhara = ? WHERE Datum_menija = ?',
      [Marenda1, Marenda2, ID_kuhara, Datum_menija],
    )
    res.json({ message: 'Meni je uspješno ažuriran' })
  } catch (err) {
    console.error('Greška kod ažuriranja:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

// DELETE za brisanje menija za odabrani datum
router.delete('/menu/delete', async (req, res) => {
  const datum = req.query.datum
  if (!datum) {
    return res.status(400).json({ message: 'Datum je obavezno' })
  }
  try {
    const connection = await getConnection()
    const [result] = await connection.execute('DELETE FROM meni WHERE Datum_menija = ?', [datum])
    if (result.affectedRows > 0) {
      res.json({ message: 'Meni je uspješno obrisan' })
    } else {
      res.status(404).json({ message: 'Nije pronađen meni za taj datum' })
    }
  } catch (err) {
    console.error('Greška kod brisanja:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

// GET za sve menije (povijest)
router.get('/menu/history', async (req, res) => {
  try {
    const connection = await getConnection()
    const [results] = await connection.execute(`
      SELECT DATE_FORMAT(Datum_menija, "%Y-%m-%d") AS Datum_menija, Marenda1, Marenda2, ID_kuhara
      FROM meni
      ORDER BY Datum_menija DESC
    `)
    res.json(results)
  } catch (err) {
    console.error('Greška kod dohvaćanja menija:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

export default router
