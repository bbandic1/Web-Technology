const Sequelize = require("sequelize");
const sequelize = require("./baza.js");
const Imenik = require("./imenik.js")(sequelize);

module.exports = function (sequelize, DataTypes) {
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

    Adresar.belongsTo(Imenik, { as: 'Kontakt', foreignKey: 'idKontakta' });
    Adresar.belongsTo(Imenik, { as: 'Poznanik', foreignKey: 'idPoznanik' });

    return Adresar;
}
