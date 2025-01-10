const express = require("express"); 
const bodyParser = require("body-parser"); 
const mysql = require("mysql2"); 

const app = express(); 
const port = 3000; 


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "imenik",
});

connection.connect((err) => {
    if (err) {
        console.error("Greška pri povezivanju s bazom: ", err);
    } else {
        console.log("Povezano s bazom!");
    }
});

app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/imenik", (req, res) => {
    const { ime_prezime, adresa, broj_telefona } = req.body;

    const sql = "INSERT INTO imenik (ime_prezime, adresa, broj_telefona) VALUES (?, ?, ?)";
    connection.query(sql, [ime_prezime, adresa, broj_telefona], (err, result) => {
        if (err) {
            console.error("Greška pri unosu podataka: ", err);
            res.status(500).send("Greška pri unosu podataka.");
        } else {
            console.log("Podaci uspešno uneseni!");
            res.send("Podaci su uspešno dodati u imenik.");
        }
    });
});

app.listen(port, () => {
    console.log(`Server je pokrenut na http://localhost:${port}`);
});
