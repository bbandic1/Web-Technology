const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Upit = sequelize.define('Upit', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        korisnik_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Korisnik',
                key: 'id',
            },
            allowNUll: false,
            filed: 'korisnik_id'
        },
        tekst: {
            type: DataTypes.TEXT,
            allowNUll: false,
            field: 'tekst',
        },
        nekretnina_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Nekretnina',
                key: 'id',
            },
            allowNUll: false,
            field: 'nekretnina_id'
        }
    }, {
        tableName: 'Upit',
        timestamps: false,
    });
    return Upit;
}