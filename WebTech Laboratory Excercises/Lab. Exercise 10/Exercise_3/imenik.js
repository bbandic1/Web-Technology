const Sequelize = require("sequelize");
const sequelize = require("./baza.js");

module.exports = function (sequelize, DataTypes) {
   const Imenik = sequelize.define('Imenik', {
      ime: Sequelize.STRING,
      prezime: Sequelize.STRING,
      adresa: Sequelize.STRING,
      brojTelefona: Sequelize.STRING,
      datumDodavanja: Sequelize.DATE
   });

   const Adresar = sequelize.define('Adresar', {
      idKontakta: {
         type: Sequelize.INTEGER,
         references: {
            model: Imenik,
            key: 'id'
         }
      },
      idPoznanik: {
         type: Sequelize.INTEGER,
         references: {
            model: Imenik,
            key: 'id'
         }
      }
   });

   return { Imenik, Adresar };
}
