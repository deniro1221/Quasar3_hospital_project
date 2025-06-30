import express from 'express'
import { Router } from 'express'
import dayjs from 'dayjs'
import pool from './db.js'
import cors from 'cors'

const app = express()
const router = Router()

const corsOptions = {
  origin: 'https://thalassockmenu.netlify.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
app.use(express.json())

const validateDateFormat = (req, res, next) => {
  const { Datum_marende } = req.body
  if (Datum_marende && !dayjs(Datum_marende, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ message: 'Neispravan format datuma. Koristite YYYY-MM-DD.' })
  }
  next()
}

router.post('/menu', validateDateFormat, async (req, res) => {
  const {
    Datum_marende,
    ID_kuhara,
    username,
    Juha_m1,
    Glavno_jelo_m1,
    Salata_m1,
    Juha_m2,
    Glavno_jelo_m2,
    Salata_m2,
  } = req.body

  if (!Datum_marende) return res.status(400).json({ message: 'Datum je obavezan.' })

  const connection = await pool.getConnection()
  let transactionStarted = false
  try {
    await connection.beginTransaction()
    transactionStarted = true

    const sql1 = `
            INSERT INTO Marenda1 (Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username)
            VALUES (?, ?, ?, ?, ?, ?)`
    await connection.execute(sql1, [
      Datum_marende,
      Juha_m1,
      Glavno_jelo_m1,
      Salata_m1,
      ID_kuhara,
      username,
    ])

    const sql2 = `
            INSERT INTO Marenda2 (Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username)
            VALUES (?, ?, ?, ?, ?, ?)`
    await connection.execute(sql2, [
      Datum_marende,
      Juha_m2,
      Glavno_jelo_m2,
      Salata_m2,
      ID_kuhara,
      username,
    ])

    await connection.commit()
    res.status(200).json({ message: 'Meniji uspješno spremljeni.' })
  } catch (err) {
    if (transactionStarted) {
      await connection.rollback()
    }
    console.error(err)
    res.status(500).json({ message: 'Greška na serveru.' })
  } finally {
    connection.release()
  }
})

router.get('/menu/today', async (req, res) => {
  const today = dayjs().format('YYYY-MM-DD')
  const connection = await pool.getConnection()
  try {
    const [m1] = await connection.execute(
      `SELECT Juha, Glavno_jelo, Salata FROM Marenda1 WHERE Datum_marende = ?`,
      [today],
    )
    const [m2] = await connection.execute(
      `SELECT Juha, Glavno_jelo, Salata FROM Marenda2 WHERE Datum_marende = ?`,
      [today],
    )

    res.json({
      Datum_marende: today,
      Marenda1: m1[0] || {},
      Marenda2: m2[0] || {},
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Greška na serveru.' })
  } finally {
    connection.release()
  }
})

router.put('/menu/fresh', validateDateFormat, async (req, res) => {
  const { Datum_marende, username, ID_kuhara } = req.body

  if (!Datum_marende) {
    return res.status(400).json({ message: 'Datum je obavezan.' })
  }

  const allowedFields = [
    'Juha_m1',
    'Glavno_jelo_m1',
    'Salata_m1',
    'Juha_m2',
    'Glavno_jelo_m2',
    'Salata_m2',
  ]

  const dishFields = Object.keys(req.body).filter((key) => allowedFields.includes(key))

  if (dishFields.length !== 1) {
    return res.status(400).json({
      message: 'Možete ažurirati samo jedno polje (Juha, Glavno_jelo, Salata) odjednom.',
    })
  }

  const field = dishFields[0]
  const value = req.body[field]

  const isM1 = field.endsWith('_m1')
  const table = isM1 ? 'Marenda1' : 'Marenda2'
  const column = field.replace('_m1', '').replace('_m2', '')

  const connection = await pool.getConnection()
  try {
    const [result] = await connection.execute(
      `UPDATE ${table} SET ${column} = ? WHERE Datum_marende = ?`,
      [value, Datum_marende],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Meni nije pronađen za taj datum.' })
    }

    if (username && ID_kuhara) {
      // Spremi korisničke podatke u istu tablicu (ako postoje kolone)
      await connection.execute(
        `UPDATE ${table} SET username = ?, ID_kuhara = ? WHERE Datum_marende = ?`,
        [username, ID_kuhara, Datum_marende],
      )
    }

    res.json({ message: 'Meni je uspješno ažuriran.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Greška na serveru.' })
  } finally {
    connection.release()
  }
})

router.delete('/menu/delete', async (req, res) => {
  const datum = req.query.datum
  if (!datum) return res.status(400).json({ message: 'Datum je obavezan.' })

  const connection = await pool.getConnection()
  try {
    const [r1] = await connection.execute(`DELETE FROM Marenda1 WHERE Datum_marende = ?`, [datum])
    const [r2] = await connection.execute(`DELETE FROM Marenda2 WHERE Datum_marende = ?`, [datum])

    if (r1.affectedRows || r2.affectedRows) {
      res.json({ message: 'Meniji su uspješno obrisani.' })
    } else {
      res.status(404).json({ message: 'Meni nije pronađen za taj datum.' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Greška na serveru.' })
  } finally {
    connection.release()
  }
})

router.get('/menu/history', async (req, res) => {
  const today = dayjs().format('YYYY-MM-DD')
  const connection = await pool.getConnection()
  try {
    const [menus] = await connection.execute(
      `
            SELECT
                Datum_marende AS Datum,
                Juha AS Juha_m1,
                Glavno_jelo AS Glavno_jelo_m1,
                Salata AS Salata_m1,
                ID_kuhara,
                username,
                'Marenda1' AS marenda
            FROM Marenda1
            WHERE Datum_marende >= ?
            UNION ALL
            SELECT
                Datum_marende AS Datum,
                Juha AS Juha_m2,
                Glavno_jelo AS Glavno_jelo_m2,
                Salata AS Salata_m2,
                ID_kuhara,
                username,
                'Marenda2' AS marenda
            FROM Marenda2
            WHERE Datum_marende >= ?
            ORDER BY Datum DESC
        `,
      [today, today],
    )

    // Manually set CORS headers for the OPTIONS request
    res.header('Access-Control-Allow-Origin', 'https://thalassockmenu.netlify.app')
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')

    res.json(menus)
  } catch (err) {
    console.error('Greška pri dohvaćanju povijesti menija:', err)
    res.status(500).json({ message: 'Greška na serveru.' })
  } finally {
    connection.release()
  }
})

export default router
