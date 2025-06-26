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
    const Glavno_jelo_m1 = req.body.Glavno_jelo_m1 || null;
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

        // ** ENFORCE UNIQUE MENU PER DAY **
        if (existingMenu1.length > 0 || existingMenu2.length > 0) {
            await connection.release();
            return res.status(400).json({ message: 'Menu already exists for this date.' });
        }

        // INSERT into Marenda1
        console.log(`Menu does not exist in Marenda1 for ${Datum_marende}. Performing INSERT.`);
        await connection.execute(
            `INSERT INTO Marenda1 (Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username)
         VALUES (?, ?, ?, ?, ?, ?)`,
            [Datum_marende, Juha_m1, Glavno_jelo_m1, Salata_m1, ID_kuhara, username],
        );

        // INSERT into Marenda2
        console.log(`Menu does not exist in Marenda2 for ${Datum_marende}. Performing INSERT.`);
        await connection.execute(
            `INSERT INTO Marenda2 (Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username)
         VALUES (?, ?, ?, ?, ?, ?)`,
            [Datum_marende, Juha_m2, Glavno_jelo_m2, Salata_m2, ID_kuhara, username],
        );

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

// PUT - Update a SINGLE menu entry in either Marenda1 or Marenda2
router.put('/menu/fresh', validateDateFormat, async (req, res) => {
    console.log("PUT /menu/fresh - req.body:", req.body);

    const { Datum_marende } = req.body;

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

        // Determine which field is being updated (Juha_m1, Glavno_jelo_m2, etc.)
        let updateField = null;
        let updateValue = null;
        let tableName = null;

        for (const key in req.body) {
            if (key !== 'Datum_marende' && req.body.hasOwnProperty(key)) {
                updateField = key;
                updateValue = req.body[key];
                break; // Exit loop after finding the field
            }
        }

        if (!updateField) {
            await connection.release();
            return res.status(400).json({ message: 'Nema polja za ažuriranje.' });
        }

        // Determine table (Marenda1 or Marenda2) based on the field
        if (updateField.endsWith('_m1')) {
            tableName = 'Marenda1';
        } else if (updateField.endsWith('_m2')) {
            tableName = 'Marenda2';
        } else {
            await connection.release();
            return res.status(400).json({ message: 'Neispravno polje za ažuriranje.' });
        }

        // Construct the SQL query
        const sql = `UPDATE ${tableName} SET ${updateField.substring(0, updateField.length - 3)} = ? WHERE Datum_marende = ?`; // Remove '_m1' or '_m2' from field name

        // Execute the query
        await connection.execute(sql, [updateValue, Datum_marende]);

        await connection.release(); // Release the connection back to the pool

        res.json({ message: 'Meni je uspješno ažuriran.' });
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

        const today = dayjs().format('YYYY-MM-DD');

        // Fetch from Marenda1
        const [m1Results] = await connection.execute(
            `SELECT Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username FROM Marenda1 WHERE Datum_marende >= ? ORDER BY Datum_marende DESC`,
            [today]
        );

        // Fetch from Marenda2
        const [m2Results] = await connection.execute(
            `SELECT Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username FROM Marenda2 WHERE Datum_marende >= ? ORDER BY Datum_marende DESC`,
            [today]
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
