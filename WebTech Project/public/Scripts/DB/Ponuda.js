const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Ponuda = sequelize.define('Ponuda', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        korisnik_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Korisnik',
                key: 'id',
            },
            field: 'korisnik_id',
        },
        tekst_upita: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'tekst_upita',
        },
        nekretnina_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Nekretnina',
                key: 'id',
            },
            allowNull: false,
            field: 'nekretnina_id',
        },
        cijenaPonude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            field: 'cijenaPonude',
        },
        datumPonude: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'datumPonude',
        },
        odbijenaPonuda: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'odbijenaPonuda',
        },
        vezanaPonuda: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Ponuda',
                key: 'id',
            },
            field: 'vezanaPonuda'
        }
    }, {
        tableName: 'Ponuda',
        timestamps: false,
    });
    return Ponuda;
}