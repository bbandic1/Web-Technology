let SpisakNekretnina = function () {

    let listaNekretnina = [];
    let listaKorisnika = [];

    let init = function (listaNekretnina, listaKorisnika) {
        this.listaNekretnina = listaNekretnina;
        this.listaKorisnika = listaKorisnika;
    }

    let filtrirajNekretnine = function(kriterij) {
        return this.listaNekretnina.filter(nekretnina => {
            if (kriterij.tip_nekretnine && nekretnina.tip_nekretnine !== kriterij.tip_nekretnine) {
                return false;
            }
            if (kriterij.naziv && !nekretnina.naziv.toLowerCase().includes(kriterij.naziv.toLowerCase())) {
                return false;
            }
            if (kriterij.min_kvadratura && nekretnina.kvadratura < kriterij.min_kvadratura) {
                return false;
            }
            if (kriterij.max_kvadratura && nekretnina.kvadratura > kriterij.max_kvadratura) {
                return false;
            }
            if (kriterij.min_cijena && nekretnina.cijena < kriterij.min_cijena) {
                return false;
            }
            if (kriterij.max_cijena && nekretnina.cijena > kriterij.max_cijena) {
                return false;
            }
            if (kriterij.kvadratura && nekretnina.kvadratura !== kriterij.kvadratura) {
                return false;
            }
            if (kriterij.cijena && nekretnina.cijena !== kriterij.cijena) {
                return false;
            }
            if (kriterij.tip_grijanja && nekretnina.tip_grijanja !== kriterij.tip_grijanja) {
                return false;
            }
            if (kriterij.lokacija && !nekretnina.lokacija.toLowerCase().includes(kriterij.lokacija.toLowerCase())) {
                return false;
            }
            if (kriterij.godina_izgradnje && nekretnina.godina_izgradnje !== kriterij.godina_izgradnje) {
                return false;
            }
            if (kriterij.datum_objave && nekretnina.datum_objave !== kriterij.datum_objave) {
                return false;
            }
            if (kriterij.opis && nekretnina.opis !== kriterij.opis) {
                return false;
            }
            return true;
        });
    }
    
    let ucitajDetaljeNekretnine = function (id) {
        return listaNekretnina.find(nekretnina => nekretnina.id === id) || null;
    }

    return {
        init: init,
        filtrirajNekretnine: filtrirajNekretnine,
        ucitajDetaljeNekretnine: ucitajDetaljeNekretnine
    }
};