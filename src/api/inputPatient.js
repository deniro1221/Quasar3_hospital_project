import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { getConnection } from './db.js'
import dayjs from 'dayjs' // Za lokalno formatiranje datuma

const app = express()
const port = 3012

app.use(cors())
app.use(bodyParser.json())

// ➕ Unos pacijenta
app.post('/dijeta-pacijent', async (req, res) => {
  const {
    Broj_sobe,
    Ime_prezime,
    Dorucak,
    Rucak,
    Vecera,
    vrsta_dijete,
    Napomene,
    U_sobu,
    Odlazak,
    Dolazak,
    ID_sestre,
  } = req.body

  const datum_unosa = dayjs().format('YYYY-MM-DD') // Lokalni datum

  try {
    const connection = await getConnection()
    await connection.execute(
      `INSERT INTO dijeta_pacijent
        (Broj_sobe, Ime_prezime, Dorucak, Rucak, Vecera, Vrsta_dijete, Napomene, U_sobu, Datum_unosa, Dolazak, Odlazak, ID_sestre)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Broj_sobe ?? null,
        Ime_prezime ?? null,
        Dorucak ?? null,
        Rucak ?? null,
        Vecera ?? null,
        vrsta_dijete ?? null,
        Napomene ?? null,
        U_sobu ?? null,
        datum_unosa,
        Dolazak ?? null,
        Odlazak ?? null,
        ID_sestre ?? null,
      ],
    )
    res.json({ message: 'Dijeta pacijenta uspješno spremljena' })
  } catch (err) {
    console.error('Greška kod unosa:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

// 📥 Dohvat svih pacijenata
app.get('/dijeta-pacijent/back', async (req, res) => {
  try {
    const connection = await getConnection()
    const [rows] = await connection.execute('SELECT * FROM dijeta_pacijent')

    // Formatiranje datuma u dd-mm-yyyy
    const formattedRows = rows.map((row) => {
      const formatDate = (dateObj) => {
        if (!dateObj) return null
        const iso = dayjs(dateObj).format('DD-MM-YYYY')
        return iso
      }

      return {
        ...row,
        Dolazak: formatDate(row.Dolazak),
        Odlazak: formatDate(row.Odlazak),
        Datum_unosa: formatDate(row.Datum_unosa),
      }
    })

    res.json(formattedRows)
  } catch (err) {
    console.error('Greška kod dohvata pacijenata:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})
// ✏️ Ažuriranje pacijenta
app.put('/dijeta-pacijent/:id', async (req, res) => {
  const { id } = req.params

  // ➕ Dodajemo ID_sestre u destructuring
  const {
    Broj_sobe,
    Ime_prezime,
    Dorucak,
    Rucak,
    Vecera,
    Vrsta_dijete,
    Napomene,
    U_sobu,
    Odlazak,
    Dolazak,
    ID_sestre, // 👈 OVDJE DODANO
  } = req.body

  const datum_unosa = dayjs().format('YYYY-MM-DD')

  try {
    const connection = await getConnection()

    // Provjera datuma odlaska
    const [result] = await connection.execute(
      `SELECT Odlazak FROM dijeta_pacijent WHERE ID_dijeta_pac = ?`,
      [id],
    )

    if (result.length === 0) {
      return res.status(404).json({ message: 'Zapis nije pronađen' })
    }

    const danas = dayjs().startOf('day')
    const postojećiOdlazak = result[0].Odlazak ? dayjs(result[0].Odlazak).startOf('day') : null

    if (postojećiOdlazak && danas.isAfter(postojećiOdlazak)) {
      return res.status(400).json({
        message: `Ažuriranje nije dozvoljeno. Datum odlaska (${postojećiOdlazak.format('DD.MM.YYYY')}) je prošao.`,
      })
    }

    // 🔄 Ažuriranje uključujući ID_sestre
    await connection.execute(
      `UPDATE dijeta_pacijent SET
        Broj_sobe = ?,
        Ime_prezime = ?,
        Dorucak = ?,
        Rucak = ?,
        Vecera = ?,
        Vrsta_dijete = ?,
        Napomene = ?,
        U_sobu = ?,
        Odlazak = ?,
        Dolazak = ?,
        Datum_unosa = ?,
        ID_sestre = ? -- 👈 DODANO OVDJE
      WHERE ID_dijeta_pac = ?`,
      [
        Broj_sobe ?? null,
        Ime_prezime ?? null,
        Dorucak ?? null,
        Rucak ?? null,
        Vecera ?? null,
        Vrsta_dijete ?? null,
        Napomene ?? null,
        U_sobu ?? null,
        Odlazak ?? null,
        Dolazak ?? null,
        datum_unosa,
        ID_sestre ?? null, // 👈 I OVDJE
        id,
      ],
    )

    res.json({ message: 'Podaci su ažurirani.' })
  } catch (err) {
    console.error('Greška kod ažuriranja:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

// Pokretanje servera
app.listen(port, () => {
  console.log(`✅ Server je pokrenut na: http://localhost:${port}`)
})
