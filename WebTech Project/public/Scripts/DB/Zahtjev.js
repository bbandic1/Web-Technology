const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Zahtjev = sequelize.define('Zahtjev', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        korisnik_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'korisnik_id',
        },
        tekst: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'tekst',
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
        trezeniDatum: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'trazeniDatum',
        },
        odobren: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'odobren',
        },
    }, {
        tableName: 'Zahtjev',
        timestamps: false,
    });
    return Zahtjev;
}