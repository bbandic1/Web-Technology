const Sequelize = require("sequelize");
const sequelize = new Sequelize("wt24", "root", "password", {
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db. Korisnik = require("../DB/Korisnik")(sequelize);
db. Nekretnina = require("../DB/Nekretnina")(sequelize);
db. Upit = require("../DB/Upit")(sequelize);
db. Zahtjev = require("../DB/Zahtjev")(sequelize);
db. Ponuda = require("../DB/Ponuda")(sequelize);

db.Korisnik.hasMany(db.Upit, {as: "Upit", foreignKey: "korisnik_id"});
db.Korisnik.hasMany(db.Zahtjev, {as: "Zahtjev", foreignKey: "korisnik_id"});
db.Korisnik.hasMany(db.Ponuda, {as: "Ponuda", foreignKey: "korisnik_id"});

db.Nekretnina.hasMany(db.Upit, {as: "Upit", foreignKey: "nekretnina_id"});
db.Nekretnina.hasMany(db.Zahtjev, {as: "Zahtjev", foreignKey: "nekretnina_id"});
db.Nekretnina.hasMany(db.Ponuda, {as: "Ponuda", foreignKey: "nekretnina_id"});

db.Upit.belongsTo(db.Korisnik, {as: "Korisnik", foreignKey: "korisnik_id"});
db.Upit.belongsTo(db.Nekretnina, {as: "Nekretnina", foreignKey: "nekretnina_id"});

db.Zahtjev.belongsTo(db.Korisnik, {as: "Korisnik", foreignKey: "korisnik_id"});
db.Zahtjev.belongsTo(db.Nekretnina, {as: "Nekretnina", foreignKey: "nekretnina_id"});

db.Ponuda.belongsTo(db.Korisnik, {as: "Korisnik", foreignKey: "korisnik_id"});
db.Ponuda.belongsTo(db.Nekretnina, {as: "Nekretnina", foreignKey: "nekretnina_id"});

db.Ponuda.hasMany(db.Ponuda, {as: "vezanePonude", foreignKey: "vezanaPonuda"});

module.exports = db;


