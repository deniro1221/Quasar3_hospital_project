import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { getConnection } from './db.js'

const app = express()
const port = 3010

app.use(cors())
app.use(bodyParser.json())

// POST za unos novog menija
app.post('/menu', async (req, res) => {
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
    console.error('Greška kod unos menija:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
  // NEKADA NE OSLOBODI, jer koristimo createConnection svakom zahtjevu
})

// GET za provjeru menija za danas
app.get('/menu/today', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10) // trenutni datum u formatu yyyy-mm-dd
  let connection
  try {
    connection = await getConnection()
    // Koristi DATE_FORMAT da vratiš datum bez vremena (YYYY-MM-DD)
    const [results] = await connection.execute(
      'SELECT DATE_FORMAT(Datum_menija, "%Y-%m-%d") AS Datum_menija, Marenda1, Marenda2 FROM meni WHERE Datum_menija = ?',
      [today],
    )
    if (results.length > 0) {
      res.json(results[0]) // Ako postoji meni za taj datum, pošaljemo ga
    } else {
      res.json(null) // Ako nema menija, vraćamo null
    }
  } catch (err) {
    console.error('Greška kod provjere menija:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

// PUT za update Marenda1 i Marenda2 za današnji datum
app.put('/menu/fresh', async (req, res) => {
  const { Datum_menija, Marenda1, Marenda2, ID_kuhara } = req.body
  if (!Datum_menija) {
    return res.status(400).json({ message: 'Datum je obavezno' })
  }
  let connection
  try {
    connection = await getConnection()
    // Ako želiš bilježiti ID_kuhara, dodaj ga u tabelu ili ga koristi za audit
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
app.delete('/menu/delete', async (req, res) => {
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

//get metoda za dohvaćanje sve iz menu
app.get('/menu/history', async (req, res) => {
  let connection
  try {
    connection = await getConnection()
    // Selektuj sve menije iz baze, formatiraj datum u yyyy-mm-dd
    const [results] = await connection.execute(`
      SELECT
        DATE_FORMAT(Datum_menija, "%Y-%m-%d") AS Datum_menija,
        Marenda1,
        Marenda2,
        ID_kuhara
      FROM meni
      ORDER BY Datum_menija DESC
    `)
    res.json(results)
  } catch (err) {
    console.error('Greška kod dohvaćanja menija:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})
//vraćanje za mainLyout.vue:
// GET za provjeru menija za danas
app.get('/menu/today_main', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10) // trenutni datum u formatu yyyy-mm-dd
  let connection
  try {
    connection = await getConnection()
    // Koristi DATE_FORMAT da vratiš datum bez vremena (YYYY-MM-DD)
    const [results] = await connection.execute(
      'SELECT DATE_FORMAT(Datum_menija, "%Y-%m-%d") AS Datum_menija, Marenda1, Marenda2 FROM meni WHERE Datum_menija = ?',
      [today],
    )
    if (results.length > 0) {
      res.json(results[0]) // Ako postoji meni za taj datum, pošaljemo ga
    } else {
      res.json(null) // Ako nema menija, vraćamo null
    }
  } catch (err) {
    console.error('Greška kod provjere menija:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})
app.listen(port, () => {
  console.log(`Server je pokrenut na http://localhost:${port}`)
})
