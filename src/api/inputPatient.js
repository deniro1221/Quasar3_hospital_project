import { getConnection } from './db.js'
import { Router } from 'express'
import dayjs from 'dayjs'

const router = Router()

// ➕ Unos pacijenta
router.post('/dijeta-pacijent', async (req, res) => {
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
    username,
  } = req.body

  const datum_unosa = dayjs().format('YYYY-MM-DD')

  try {
    const connection = await getConnection()
    await connection.execute(
      `INSERT INTO dijeta_pacijent
        (Broj_sobe, Ime_prezime, Dorucak, Rucak, Vecera, Vrsta_dijete, Napomene, U_sobu, Datum_unosa, Dolazak, Odlazak, ID_sestre, username)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        username ?? null,
      ],
    )
    res.json({ message: 'Dijeta pacijenta uspješno spremljena' })
  } catch (err) {
    console.error('Greška kod unosa:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

// 📥 Dohvat svih pacijenata
router.get('/dijeta-pacijent/back', async (req, res) => {
  try {
    const connection = await getConnection()
    const [rows] = await connection.execute(
      `SELECT dijeta_pacijent.* , login_nurse.username
      FROM dijeta_pacijent
      JOIN login_nurse ON dijeta_pacijent.ID_sestre = login_nurse.ID_sestre`,
    )

    const formattedRows = rows.map((row) => {
      const formatDate = (dateObj) => {
        if (!dateObj) return null
        return dayjs(dateObj).format('DD-MM-YYYY')
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

// 📥 Dohvat aktivnih pacijenata
router.get('/dijeta-pacijent/active', async (req, res) => {
  try {
    const connection = await getConnection()
    const [rows] = await connection.execute(
      `SELECT dijeta_pacijent.* , login_nurse.username
      FROM dijeta_pacijent
      JOIN login_nurse ON dijeta_pacijent.ID_sestre = login_nurse.ID_sestre
      WHERE Odlazak >= CURDATE() OR Odlazak IS NULL`,
    )

    const formattedRows = rows.map((row) => {
      const formatDate = (dateObj) => {
        if (!dateObj) return null
        return dayjs(dateObj).format('DD-MM-YYYY')
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
    console.error('Greška kod dohvata aktivnih pacijenata:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

// ✏️ Ažuriranje pacijenta
router.put('/dijeta-pacijent/:id', async (req, res) => {
  const { id } = req.params
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
    ID_sestre,
    username,
  } = req.body

  const datum_unosa = dayjs().format('YYYY-MM-DD')

  try {
    const connection = await getConnection()

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
        message: `Ažuriranje nije dozvoljeno. Datum odlaska (${postojećiOdlazak.format(
          'DD.MM.YYYY',
        )}) je prošao.`,
      })
    }

    await connection.execute(
      `UPDATE dijeta_pacijent SET
        Broj_sobe = ?, Ime_prezime = ?, Dorucak = ?, Rucak = ?, Vecera = ?, Vrsta_dijete = ?,
        Napomene = ?, U_sobu = ?, Odlazak = ?, Dolazak = ?, Datum_unosa = ?, ID_sestre = ?, username = ?
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
        ID_sestre ?? null,
        username ?? null,
        id,
      ],
    )

    res.json({ message: 'Podaci su ažurirani.' })
  } catch (err) {
    console.error('Greška kod ažuriranja:', err)
    res.status(500).json({ message: 'Greška na serveru' })
  }
})

export default router
