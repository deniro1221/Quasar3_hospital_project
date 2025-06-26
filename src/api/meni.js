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

    const entry = Object.entries(req.body).find(([key]) => key !== 'Datum_marende');
    if (!entry) return res.status(400).json({ message: 'Nema podataka za ažuriranje.' });

    const [field, value] = entry;
    const isM1 = field.endsWith('_m1');
    const table = isM1 ? 'Marenda1' : field.endsWith('_m2') ? 'Marenda2' : null;
    if (!table) return res.status(400).json({ message: 'Neispravno polje.' });

    const column = field.replace('_m1', '').replace('_m2', '');
    const sql = `UPDATE ${table} SET ${column} = ? WHERE Datum_marende = ?`;

    const connection = await pool.getConnection();
    try {
        await connection.execute(sql, [value, Datum_marende]);
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
        const [m1] = await connection.execute(`
            SELECT Datum_marende AS Datum, Juha, Glavno_jelo, Salata, ID_kuhara, username FROM Marenda1
            WHERE Datum_marende >= ? ORDER BY Datum_marende DESC`, [today]);
        const [m2] = await connection.execute(`
            SELECT Datum_marende AS Datum, Juha, Glavno_jelo, Salata, ID_kuhara, username FROM Marenda2
            WHERE Datum_marende >= ? ORDER BY Datum_marende DESC`, [today]);

        const data = [...m1.map(r => ({ ...r, marenda: 'Marenda 1' })), ...m2.map(r => ({ ...r, marenda: 'Marenda 2' }))];
        res.json(data.sort((a, b) => dayjs(b.Datum).diff(dayjs(a.Datum))));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Greška na serveru.' });
    } finally {
        connection.release();
    }
});

export default router;
