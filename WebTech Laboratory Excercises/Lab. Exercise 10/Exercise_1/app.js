const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./baza.js");
const Imenik = require('./imenik.js')(sequelize);

Imenik.sync().then(() => {
    console.log("Tabela imenik je sinhronizovana!");
}).catch((err) => {
    console.error("Greška pri sinhronizaciji tabele: ", err);
});

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/imenik", (req, res) => {
    Imenik.findAll()
        .then(imena => {
            let html = '<table border="1"><tr><th>ID</th><th>Ime</th><th>Prezime</th><th>Adresa</th><th>Broj Telefona</th><th>Datum Dodavanja</th></tr>';
            imena.forEach(im => {
                html += `<tr>
                            <td>${im.id}</td>
                            <td>${im.ime}</td>
                            <td>${im.prezime}</td>
                            <td>${im.adresa}</td>
                            <td>${im.brojTelefona}</td>
                            <td>${im.datumDodavanja}</td>
                          </tr>`;
            });
            html += '</table>';
            res.send(html);
        })
        .catch((err) => {
            console.error("Greška pri dohvatu podataka: ", err);
            res.status(500).send("Greška pri dohvatu podataka.");
        });
});

app.listen(port, () => {
    console.log(`Server je pokrenut na http://localhost:${port}`);
});
