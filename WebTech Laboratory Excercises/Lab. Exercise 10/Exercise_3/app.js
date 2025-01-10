const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./baza.js');
const { Imenik, Adresar } = require('./imenik.js')(sequelize);
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/poznanik/:kontakt", (req, res) => {
   const kontaktId = req.params.kontakt;

   // Pretražujemo Adresar tabelu da dobijemo kontakte sa odgovarajućim idKontakta
   Adresar.findAll({
      where: { idKontakta: kontaktId },
      include: [
         {
            model: Imenik,
            as: 'Poznanik',
            attributes: ['ime', 'adresa', 'brojTelefona']
         }
      ]
   }).then(poznanici => {
      if (poznanici.length === 0) {
         return res.send("Nema poznanika za datog kontakta.");
      }

      let html = `<h1>Kontakti za Poznanika ID ${kontaktId}</h1><table border="1">
                  <tr><th>Ime</th><th>Adresa</th><th>Broj Telefona</th></tr>`;

      poznanici.forEach(poznanik => {
         html += `<tr>
                     <td>${poznanik.Poznanik.ime} ${poznanik.Poznanik.prezime}</td>
                     <td>${poznanik.Poznanik.adresa}</td>
                     <td>${poznanik.Poznanik.brojTelefona}</td>
                   </tr>`;
      });

      html += `</table>`;
      res.send(html);
   }).catch(err => {
      console.error("Greška prilikom pretrage: ", err);
      res.status(500).send("Greška prilikom pretrage.");
   });
});

app.listen(port, () => {
   console.log(`Server je pokrenut na http://localhost:${port}`);
});
