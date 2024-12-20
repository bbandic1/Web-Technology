const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/unos', (req, res) => {
    res.sendFile(path.join(__dirname, 'forma.html'));
});

app.post('/', (req, res) => {
    const { ime, prezime, adresa, broj_telefona } = req.body;
    const novaLinija = `${ime},${prezime},${adresa},${broj_telefona}`;

    fs.appendFile('imenik.txt', novaLinija + '\r\n', (err) => {
        if (err) {
            res.status(500).send('Došlo je do greške pri dodavanju podataka.');
            return;
        }

        fs.readFile('imenik.txt', 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Došlo je do greške pri čitanju podataka.');
                return;
            }

            const rows = data
                .split('\n')
                .filter(line => line.trim() !== '')
                .map(line => {
                    const [ime, prezime, adresa, broj_telefona] = line.split(',');
                    return `<tr><td>${ime}</td><td>${prezime}</td><td>${adresa}</td><td>${broj_telefona}</td></tr>`;
                })
                .join('');

            const tabela = `
                <html>
                <head><title>Imenik</title></head>
                <body>
                    <h1>Imenik</h1>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Ime</th>
                                <th>Prezime</th>
                                <th>Adresa</th>
                                <th>Broj Telefona</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            res.send(tabela);
        });
    });
});

app.listen(8085, () => {
    console.log('Server pokrenut na http://localhost:8085');
});
