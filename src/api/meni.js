import { Router } from 'express';
import dayjs from 'dayjs';
import pool, { getConnection } from './db.js'; // Import pool

const router = Router();

// Middleware to validate date format
const validateDateFormat = (req, res, next) => {
  const { Datum_marende } = req.body;
  if (Datum_marende && !dayjs(Datum_marende, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ message: 'Neispravan format datuma. Koristite YYYY-MM-DD.' });
  }
  next();
};

// POST - Create menu entries in both Marenda1 and Marenda2
router.post('/menu', validateDateFormat, async (req, res) => {
  console.log("POST /menu - req.body:", req.body);

  const { Datum_marende, ID_kuhara } = req.body;
  const username = req.body.username || null;

  const Juha_m1 = req.body.Juha_m1 || null;
  const Glavno_jelo_m1 = req.body.Glavno_jelo_m1 = null;
  const Salata_m1 = req.body.Salata_m1 || null;
  const Juha_m2 = req.body.Juha_m2 || null;
  const Glavno_jelo_m2 = req.body.Glavno_jelo_m2 || null;
  const Salata_m2 = req.body.Salata_m2 || null;

  console.log("POST /menu - Values after null check:", { Datum_marende, Juha_m1, Glavno_jelo_m1, Salata_m1, Juha_m2, Glavno_jelo_m2, Salata_m2, ID_kuhara, username });

  if (!Datum_marende) {
    return res.status(400).json({ message: 'Datum je obavezan.' });
  }

  let connection;
  try {
    connection = await pool.getConnection(); // Get connection from pool

    // ** CHECK IF MENU ALREADY EXISTS IN Marenda1 **
    const [existingMenu1] = await connection.execute(
      `SELECT Datum_marende FROM Marenda1 WHERE Datum_marende = ?`,
      [Datum_marende]
    );

    // ** CHECK IF MENU ALREADY EXISTS IN Marenda2 **
    const [existingMenu2] = await connection.execute(
      `SELECT Datum_marende FROM Marenda2 WHERE Datum_marende = ?`,
      [Datum_marende]
    );

    // DETERMINE INSERT OR UPDATE FOR MARENDA1
    if (existingMenu1.length > 0) {
      // UPDATE Marenda1
      console.log(`Menu exists in Marenda1 for ${Datum_marende}.  Performing UPDATE.`);
      await connection.execute(
        `UPDATE Marenda1 SET Juha = ?, Glavno_jelo = ?, Salata = ?, ID_kuhara = ?, username = ? WHERE Datum_marende = ?`,
        [Juha_m1, Glavno_jelo_m1, Salata_m1, ID_kuhara, username, Datum_marende],
      );
    } else {
      // INSERT into Marenda1
      console.log(`Menu does not exist in Marenda1 for ${Datum_marende}. Performing INSERT.`);
      await connection.execute(
        `INSERT INTO Marenda1 (Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [Datum_marende, Juha_m1, Glavno_jelo_m1, Salata_m1, ID_kuhara, username],
      );
    }

    // DETERMINE INSERT OR UPDATE FOR MARENDA2
    if (existingMenu2.length > 0) {
      // UPDATE Marenda2
      console.log(`Menu exists in Marenda2 for ${Datum_marende}.  Performing UPDATE.`);
      await connection.execute(
        `UPDATE Marenda2 SET Juha = ?, Glavno_jelo = ?, Salata = ?, ID_kuhara = ?, username = ? WHERE Datum_marende = ?`,
        [Juha_m2, Glavno_jelo_m2, Salata_m2, ID_kuhara, username, Datum_marende],
      );
    } else {
      // INSERT into Marenda2
      console.log(`Menu does not exist in Marenda2 for ${Datum_marende}. Performing INSERT.`);
      await connection.execute(
        `INSERT INTO Marenda2 (Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [Datum_marende, Juha_m2, Glavno_jelo_m2, Salata_m2, ID_kuhara, username],
      );
    }

    await connection.release(); // Release the connection back to the pool
    res.json({ message: 'Meniji uspješno spremljeni.' });

  } catch (err) {
    console.error('Greška kod unosa/ažuriranja menija:', err);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

// GET - Get menu for today from both Marenda1 and Marenda2
router.get('/menu/today', async (req, res) => {
  const today = dayjs().format('YYYY-MM-DD');

  let connection;
  try {
    connection = await pool.getConnection(); // Get connection from pool

    // Fetch from Marenda1
    const [m1Results] = await connection.execute(
      `SELECT Juha, Glavno_jelo, Salata FROM Marenda1 WHERE Datum_marende = ?`,
      [today],
    );

    // Fetch from Marenda2
    const [m2Results] = await connection.execute(
      `SELECT Juha, Glavno_jelo, Salata FROM Marenda2 WHERE Datum_marende = ?`,
      [today],
    );

    await connection.release(); // Release the connection back to the pool

    const marenda1 = m1Results[0] || {};
    const marenda2 = m2Results[0] || {};

    res.json({ Datum_marende: today, Marenda1: marenda1, Marenda2: marenda2 });
  } catch (err) {
    console.error('Greška kod dohvata menija za danas:', err);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

// PUT - Update menu entries in both Marenda1 and Marenda2
router.put('/menu/fresh', validateDateFormat, async (req, res) => {
  console.log("PUT /menu/fresh - req.body:", req.body);

  const { Datum_marende, ID_kuhara } = req.body;
  const username = req.body.username || null;

  const Juha_m1 = req.body.Juha_m1 || null;
  const Glavno_jelo_m1 = req.body.Glavno_jelo_m1 || null;
  const Salata_m1 = req.body.Salata_m1 || null;
  const Juha_m2 = req.body.Juha_m2 || null;
  const Glavno_jelo_m2 = req.body.Glavno_jelo_m2 || null;
  const Salata_m2 = req.body.Salata_m2 || null;

  console.log("PUT /menu/fresh - Values after null check:", { Datum_marende, Juha_m1, Glavno_jelo_m1, Salata_m1, Juha_m2, Glavno_jelo_m2, Salata_m2, ID_kuhara, username });

  if (!Datum_marende) {
    return res.status(400).json({ message: 'Datum je obavezan.' });
  }

  const today = dayjs().format('YYYY-MM-DD');
  if (dayjs(Datum_marende).isBefore(today, 'day')) {
    return res.status(400).json({ message: 'Ne možete uređivati menije za prošle datume.' });
  }

  let connection;
  try {
    connection = await pool.getConnection(); // Get connection from pool

    // Update Marenda1
    await connection.execute(
      `UPDATE Marenda1 SET Juha = ?, Glavno_jelo = ?, Salata = ?, ID_kuhara = ?, username = ? WHERE Datum_marende = ?`,
      [Juha_m1, Glavno_jelo_m1, Salata_m1, ID_kuhara, username, Datum_marende],
    );

    // Update Marenda2
    await connection.execute(
      `UPDATE Marenda2 SET Juha = ?, Glavno_jelo = ?, Salata = ?, ID_kuhara = ?, username = ? WHERE Datum_marende = ?`,
      [Juha_m2, Glavno_jelo_m2, Salata_m2, ID_kuhara, username, Datum_marende],
    );

    await connection.release(); // Release the connection back to the pool

    res.json({ message: 'Meniji su uspješno ažurirani.' });
  } catch (err) {
    console.error('Greška kod ažuriranja menija:', err);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

// DELETE - Delete menu entries from both Marenda1 and Marenda2
router.delete('/menu/delete', async (req, res) => {
  const datum = req.query.datum;

  if (!datum) {
    return res.status(400).json({ message: 'Datum je obavezan.' });
  }

  const today = dayjs().format('YYYY-MM-DD');
  if (dayjs(datum).isBefore(today, 'day')) {
    return res.status(400).json({ message: 'Ne možete brisati menije za prošle datume.' });
  }

  let connection;
  try {
    connection = await pool.getConnection(); // Get connection from pool

    // Delete from Marenda1
    const [result1] = await connection.execute(`DELETE FROM Marenda1 WHERE Datum_marende = ?`, [datum]);

    // Delete from Marenda2
    const [result2] = await connection.execute(`DELETE FROM Marenda2 WHERE Datum_marende = ?`, [datum]);

    await connection.release(); // Release the connection back to the pool

    if (result1.affectedRows + result2.affectedRows > 0) {
      res.json({ message: 'Meniji su uspješno obrisani.' });
    } else {
      res.status(404).json({ message: 'Nije pronađen meni za taj datum.' });
    }
  } catch (err) {
    console.error('Greška kod brisanja menija:', err);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

// GET - Get menu history (from both Marenda1 and Marenda2)
router.get('/menu/history', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection(); // Get connection from pool

    // Fetch from Marenda1
    const [m1Results] = await connection.execute(
      `SELECT Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username FROM Marenda1 ORDER BY Datum_marende DESC`,
    );

    // Fetch from Marenda2
    const [m2Results] = await connection.execute(
      `SELECT Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username FROM Marenda2 ORDER BY Datum_marende DESC`,
    );

    await connection.release(); // Release the connection back to the pool

    // Dodajemo polje marenda u svaki zapis
    const m1WithLabel = m1Results.map(item => ({ ...item, marenda: 'Marenda 1' }));
    const m2WithLabel = m2Results.map(item => ({ ...item, marenda: 'Marenda 2' }));

    // Spajanje i sortiranje od najnovijeg do najstarijeg
    const combinedResults = [...m1WithLabel, ...m2WithLabel].sort((a, b) =>
      dayjs(a.Datum_marende).isBefore(b.Datum_marende) ? 1 : -1
    );

    res.json(combinedResults);
  } catch (err) {
    console.error('Greška kod dohvata povijesti menija:', err);
    res.status(500).json({ message: 'Greška na serveru.' });
  }
});

export default router;
