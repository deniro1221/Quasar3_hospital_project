import { Router } from 'express';
import dayjs from 'dayjs';
import pool from './db.js'; // Connection pool

const router = Router();

// Middleware za validaciju formata datuma
const validateDateFormat = (req, res, next) => {
    const { Datum_marende } = req.body;
    if (Datum_marende && !dayjs(Datum_marende, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Neispravan format datuma. Koristite YYYY-MM-DD.' });
    }
    next();
};

// POST - Dodavanje menija
router.post('/menu', validateDateFormat, async (req, res) => {
    const {
        Datum_marende, ID_kuhara, username,
        Juha_m1, Glavno_jelo_m1, Salata_m1,
        Juha_m2, Glavno_jelo_m2, Salata_m2
    } = req.body;

    if (!Datum_marende) return res.status(400).json({ message: 'Datum je obavezan.' });

    const connection = await pool.getConnection();
    try {
        // Provjera duplikata
        const [existing1] = await connection.execute(
            `SELECT 1 FROM Marenda1 WHERE Datum_marende = ?`, [Datum_marende]
        );
        const [existing2] = await connection.execute(
            `SELECT 1 FROM Marenda2 WHERE Datum_marende = ?`, [Datum_marende]
        );
        if (existing1.length || existing2.length) {
            return res.status(400).json({ message: 'Meni već postoji za taj datum.' });
        }

        // Unos u obje tablice
        await connection.beginTransaction();
        await connection.execute(`
            INSERT INTO Marenda1 (Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username)
            VALUES (?, ?, ?, ?, ?, ?)`, [Datum_marende, Juha_m1, Glavno_jelo_m1, Salata_m1, ID_kuhara, username]);
        await connection.execute(`
            INSERT INTO Marenda2 (Datum_marende, Juha, Glavno_jelo, Salata, ID_kuhara, username)
            VALUES (?, ?, ?, ?, ?, ?)`, [Datum_marende, Juha_m2, Glavno_jelo_m2, Salata_m2, ID_kuhara, username]);

        await connection.commit();
        res.status(200).json({ message: 'Meniji uspješno spremljeni.' });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Greška na serveru.' });
    } finally {
        connection.release();
    }
});

// GET - Dohvati današnji meni
router.get('/menu/today', async (req, res) => {
    const today = dayjs().format('YYYY-MM-DD');
    const connection = await pool.getConnection();
    try {
        const [m1] = await connection.execute(
            `SELECT Juha, Glavno_jelo, Salata FROM Marenda1 WHERE Datum_marende = ?`, [today]);
        const [m2] = await connection.execute(
            `SELECT Juha, Glavno_jelo, Salata FROM Marenda2 WHERE Datum_marende = ?`, [today]);

        res.json({
            Datum_marende: today,
            Marenda1: m1[0] || {},
            Marenda2: m2[0] || {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Greška na serveru.' });
    } finally {
        connection.release();
    }
});

// PUT - Ažuriraj pojedinačno polje
router.put('/menu/fresh', validateDateFormat, async (req, res) => {
    const { Datum_marende } = req.body;
    if (!Datum_marende) return res.status(400).json({ message: 'Datum je obavezan.' });
    if (dayjs(Datum_marende).isBefore(dayjs(), 'day')) {
        return res.status(400).json({ message: 'Ne možete uređivati menije za prošle datume.' });
    }

    // Validate that only one field (other than Datum_marende) is being updated
    const allowedFields = ['Juha_m1', 'Glavno_jelo_m1', 'Salata_m1', 'Juha_m2', 'Glavno_jelo_m2', 'Salata_m2'];
    const updateFields = Object.keys(req.body).filter(key => key !== 'Datum_marende');

    if (updateFields.length !== 1 || !allowedFields.includes(updateFields[0])) {
        return res.status(400).json({ message: 'Možete ažurirati samo jedno polje (Juha, Glavno_jelo, Salata) odjednom.' });
    }

    const [field, value] = [updateFields[0], req.body[updateFields[0]]];
    const isM1 = field.endsWith('_m1');
    const table = isM1 ? 'Marenda1' : 'Marenda2';
    const column = field.replace('_m1', '').replace('_m2', '');
    const sql = `UPDATE ${table} SET ${column} = ? WHERE Datum_marende = ?`;

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(sql, [value, Datum_marende]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Meni nije pronađen za taj datum.' });
        }
        res.json({ message: 'Meni je uspješno ažuriran.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Greška na serveru.' });
    } finally {
        connection.release();
    }
});


// DELETE - Briši meni
router.delete('/menu/delete', async (req, res) => {
    const datum = req.query.datum;
    if (!datum) return res.status(400).json({ message: 'Datum je obavezan.' });
    if (dayjs(datum).isBefore(dayjs(), 'day')) {
        return res.status(400).json({ message: 'Ne možete brisati menije za prošle datume.' });
    }

    const connection = await pool.getConnection();
    try {
        const [r1] = await connection.execute(`DELETE FROM Marenda1 WHERE Datum_marende = ?`, [datum]);
        const [r2] = await connection.execute(`DELETE FROM Marenda2 WHERE Datum_marende = ?`, [datum]);

        if (r1.affectedRows || r2.affectedRows) {
            res.json({ message: 'Meniji su uspješno obrisani.' });
        } else {
            res.status(404).json({ message: 'Meni nije pronađen za taj datum.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Greška na serveru.' });
    } finally {
        connection.release();
    }
});

// GET - Povijest menija
router.get('/menu/history', async (req, res) => {
    const today = dayjs().format('YYYY-MM-DD');
    const connection = await pool.getConnection();
    try {
        console.log("Dohvaćam povijest menija za datum:", today); // Dodano

        const [menus] = await connection.execute(`
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
            ORDER BY Datum_marende DESC
        `, [today, today]);

        console.log("Rezultat upita:", menus); // Dodano

        res.json(menus);
    } catch (err) {
        console.error("Greška pri dohvaćanju povijesti menija:", err); // Dodano
        res.status(500).json({ message: 'Greška na serveru.' });
    } finally {
        connection.release();
    }
});

export default router;
