import { Router } from 'express'
import { getConnection } from './db.js'

const router = Router()

// GET sestra
export const getNurse = async (req, res) => {
  const connection = await getConnection()
  try {
    const [rows] = await connection.execute('SELECT * FROM sestra')
    res.json(rows)
  } catch (error) {
    console.error('Greška prilikom dohvaćanja podataka:', error)
    res.status(500).json({ message: 'Greška na serveru.' })
  } finally {
    await connection.end()
  }
}

// ADD sestra
export const addNurse = async (req, res) => {
  const { Ime_sestre, Prezime_sestre, username, lozinka } = req.body
  const connection = await getConnection()
  try {
    await connection.execute(
      'INSERT INTO sestra (Ime_sestre, Prezime_sestre, username, lozinka) VALUES (?, ?, ?, ?)',
      [Ime_sestre, Prezime_sestre, username, lozinka],
    )
    res.status(201).json({ message: 'Sestra dodana uspješno' })
  } catch (error) {
    console.error('Greška prilikom dodavanja sestre:', error)
    res.status(500).json({ message: 'Greška prilikom dodavanja.' })
  } finally {
    await connection.end()
  }
}

// UPDATE sestra
export const updateNurse = async (req, res) => {
  const { ID_sestre } = req.params
  const { Ime_sestre, Prezime_sestre } = req.body
  const connection = await getConnection()
  try {
    await connection.execute(
      'UPDATE sestra SET Ime_sestre = ?, Prezime_sestre = ? WHERE ID_sestre = ?',
      [Ime_sestre, Prezime_sestre, ID_sestre],
    )
    res.json({ message: 'Sestra ažurirana uspješno' })
  } catch (error) {
    console.error('Greška prilikom ažuriranja sestre:', error)
    res.status(500).json({ message: 'Greška prilikom ažuriranja.' })
  } finally {
    await connection.end()
  }
}

// DELETE sestra
export const deleteNurse = async (req, res) => {
  const { ID_sestre } = req.params
  const connection = await getConnection()
  try {
    await connection.execute('DELETE FROM sestra WHERE ID_sestre = ?', [ID_sestre])
    res.json({ message: 'Sestra izbrisana uspješno' })
  } catch (error) {
    console.error('Greška prilikom brisanja sestre:', error)
    res.status(500).json({ message: 'Greška prilikom brisanja.' })
  } finally {
    await connection.end()
  }
}

router.get('/', getNurse)
router.post('/', addNurse)
router.put('/:ID_sestre', updateNurse)
router.delete('/:ID_sestre', deleteNurse)

export default router
