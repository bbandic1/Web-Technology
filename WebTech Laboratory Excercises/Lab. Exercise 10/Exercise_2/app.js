const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const sequelize = require('./baza.js');
const express = require("express");
const app = express();
const Imenik = require('./imenik.js')(sequelize);
const Adresar = require('./adresar.js')(sequelize);

Imenik.sync();
Adresar.sync();

app.listen(3000, () => {
    console.log("Server je pokrenut na http://localhost:3000");
});
