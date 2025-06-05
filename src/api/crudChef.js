import { Router } from 'express'

import { getConnection } from './db.js'
const router = Router()

// GET kuhari
export const getChefs = async (req, res) => {
  const connection = await getConnection()
  try {
    const [rows] = await connection.execute('SELECT * FROM kuhar')
    res.json(rows)
  } catch (error) {
    console.error('Greška prilikom dohvaćanja kuhara:', error)
    res.status(500).json({ message: 'Greška na serveru.' })
  } finally {
    await connection.end()
  }
}

// ADD kuhar
export const addChef = async (req, res) => {
  const { Ime_kuhara, Prezime_kuhara, username, lozinka } = req.body
  const connection = await getConnection()
  try {
    await connection.execute(
      'INSERT INTO kuhar (Ime_kuhara, Prezime_kuhara, username, lozinka) VALUES (?, ?, ?, ?)',
      [Ime_kuhara, Prezime_kuhara, username, lozinka],
    )
    res.status(201).json({ message: 'Kuhar dodan uspješno' })
  } catch (error) {
    console.error('Greška prilikom dodavanja kuhara:', error)
    res.status(500).json({ message: 'Greška prilikom dodavanja.' })
  } finally {
    await connection.end()
  }
}

// UPDATE kuhar
export const updateChef = async (req, res) => {
  const { ID_kuhara } = req.params
  const { Ime_kuhara, Prezime_kuhara } = req.body
  const connection = await getConnection()
  try {
    await connection.execute(
      'UPDATE kuhar SET Ime_kuhara = ?, Prezime_kuhara = ? WHERE ID_kuhara = ?',
      [Ime_kuhara, Prezime_kuhara, ID_kuhara],
    )
    res.json({ message: 'Kuhar ažuriran uspješno' })
  } catch (error) {
    console.error('Greška prilikom ažuriranja kuhara:', error)
    res.status(500).json({ message: 'Greška prilikom ažuriranja.' })
  } finally {
    await connection.end()
  }
}

// DELETE kuhar
export const deleteChef = async (req, res) => {
  const { ID_kuhara } = req.params
  const connection = await getConnection()
  try {
    await connection.execute('DELETE FROM kuhar WHERE ID_kuhara = ?', [ID_kuhara])
    res.json({ message: 'Kuhar izbrisan uspješno' })
  } catch (error) {
    console.error('Greška prilikom brisanja kuhara:', error)
    res.status(500).json({ message: 'Greška prilikom brisanja.' })
  } finally {
    await connection.end()
  }
}

// Definiraj rute u routeru
router.get('/', getChefs)
router.post('/', addChef)
router.put('/:ID_kuhara', updateChef)
router.delete('/:ID_kuhara', deleteChef)

export default router
