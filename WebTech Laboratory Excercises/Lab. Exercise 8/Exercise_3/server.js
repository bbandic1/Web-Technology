const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(cors());

let unosi = [];

app.post("/", (req, res) => {
    const noviUnos = req.body;
    unosi.push(noviUnos); 
    res.status(200).json(unosi);
});

app.listen(8085, () => {
    console.log("Server pokrenut na http://localhost:8085");
});
