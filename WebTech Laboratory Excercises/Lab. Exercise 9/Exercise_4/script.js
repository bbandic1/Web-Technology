const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'imenik' 
});


db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    console.log('Connected to the database');
});

app.get('/imenik', (req, res) => {
    const query = 'SELECT * FROM imenik';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Server error');
            return;
        }

        let html = `
            <html>
            <head>
                <title>Imenik</title>
                <style>
                    table { width: 50%; margin: 20px auto; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                </style>
            </head>
            <body>
                <h1 style="text-align: center;">Imenik</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Ime i Prezime</th>
                            <th>Adresa</th>
                            <th>Broj Telefona</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        results.forEach((row) => {
            html += `
                <tr>
                    <td>${row.ime_prezime}</td>
                    <td>${row.adresa}</td>
                    <td>${row.broj_telefona}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        res.send(html);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
