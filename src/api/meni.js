import express from 'express'
import { Router } from 'express'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
dayjs.extend(utc)
import pool from './db.js'
import cors from 'cors'

const app = express()
const router = Router()

app.use(cors())
app.use(express.json())

const validateDateFormat = (req, res, next) => {
  const { Datum_marende } = req.body
  if (Datum_marende) {
    if (!dayjs(Datum_marende, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ message: 'Neispravan format datuma. Koristite YYYY-MM-DD.' })
    }
    // Konvertiraj u UTC
    req.body.Datum_marende = dayjs.utc(Datum_marende).format('YYYY-MM-DD')
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
  const {
    Datum_marende,
    Juha_m1,
    Glavno_jelo_m1,
    Salata_m1,
    Juha_m2,
    Glavno_jelo_m2,
    Salata_m2,
    username,
    ID_kuhara,
  } = req.body

  if (!Datum_marende) {
    return res.status(400).json({ message: 'Datum je obavezan.' })
  }

  const connection = await pool.getConnection()
  try {
    const [result1] = await connection.execute(
      `UPDATE Marenda1 SET Juha = ?, Glavno_jelo = ?, Salata = ? WHERE Datum_marende = ?`,
      [Juha_m1, Glavno_jelo_m1, Salata_m1, Datum_marende],
    )
    const [result2] = await connection.execute(
      `UPDATE Marenda2 SET Juha = ?, Glavno_jelo = ?, Salata = ? WHERE Datum_marende = ?`,
      [Juha_m2, Glavno_jelo_m2, Salata_m2, Datum_marende],
    )

    if (username && ID_kuhara) {
      // Spremi korisničke podatke u istu tablicu (ako postoje kolone)
      await connection.execute(
        `UPDATE Marenda1 SET username = ?, ID_kuhara = ? WHERE Datum_marende = ?`,
        [username, ID_kuhara, Datum_marende],
      )
      await connection.execute(
        `UPDATE Marenda2 SET username = ?, ID_kuhara = ? WHERE Datum_marende = ?`,
        [username, ID_kuhara, Datum_marende],
      )
    }

    if (result1.affectedRows === 0 || result2.affectedRows === 0) {
      return res.status(404).json({ message: 'Meni nije pronađen za taj datum.' })
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

    res.json(menus)
  } catch (err) {
    console.error('Greška pri dohvaćanju povijesti menija:', err)
    res.status(500).json({ message: 'Greška na serveru.' })
  } finally {
    connection.release()
  }
})

// pregled neaKtivnih menija:
router.get('/menu/history/noActive', async (req, res) => {
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
            WHERE Datum_marende < ?
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
            WHERE Datum_marende < ?
            ORDER BY Datum DESC
        `,
      [today, today],
    )

    res.json(menus)
  } catch (err) {
    console.error('Greška pri dohvaćanju povijesti menija:', err)
    res.status(500).json({ message: 'Greška na serveru.' })
  } finally {
    connection.release()
  }
})

export default router
