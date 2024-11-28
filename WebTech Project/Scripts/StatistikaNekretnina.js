let StatistikaNekretnina = function () {

    let listaNekretnina = [];
    let listaKorisnika = [];

    let spisakNekretnina = new SpisakNekretnina();

    let init = function (listaNekretnina, listaKorisnika) {
      spisakNekretnina.init(listaNekretnina, listaKorisnika);
      this.listaNekretnina = spisakNekretnina.listaNekretnina;
      this.listaKorisnika = spisakNekretnina.listaKorisnika
    };

    let prosjecnaKvadratura = function (kriterij) {
      const filtriraneNekretnine = spisakNekretnina.filtrirajNekretnine(kriterij);
      return filtriraneNekretnine.reduce((suma, property) => suma + property.kvadratura, 0) / filteredProperties.length;
    };

    let outlier = function (kriterij, nazivSvojstva) {

        const filtriraneNekretnine = spisakNekretnina.filtrirajNekretnine(kriterij);

        if (filtriraneNekretnine.length === 0) {
            return null;
        }

        const suma = filtriraneNekretnine.reduce((total, property) => total + property[nazivSvojstva], 0);
        const average = suma / filtriraneNekretnine.length;

        return filtriraneNekretnine.reduce((maxOutlier, property) => {
            const trenutnaRazilka = Math.abs(property[nazivSvojstva] - average);
            return trenutnaRazilka > maxOutlier.difference ? { property, difference: trenutnaRazilka } : maxOutlier;
        }, { property: null, difference: 0 }).property;
    }

    let histogramCijena = function(periodi, rasponiCijena) {
        return periodi.flatMap((period, periodIndex) => {
            return rasponiCijena.map((raspon, rasponIndex) => {
                const filtriraneNekretnine = listaNekretnina.filter(nekretnina => {
                    return nekretnina.godina_objave >= period.od &&
                           nekretnina.godina_objave <= period.do &&
                           nekretnina.cijena >= raspon.od &&
                           nekretnina.cijena <= raspon.do;
                });
    
                console.log(`Period (${period.od}-${period.do}), Raspon (${raspon.od}-${raspon.do}):`, filtriraneNekretnine);
    
                return {
                    indeksPerioda: periodIndex,
                    indeksRasponaCijena: rasponIndex,
                    brojNekretnina: filtriraneNekretnine.length
                };
            });
        }).flat();
    };
    
    let mojeNekretnine = function (korisnik) {
        const nekretnineSaUpitomKorisnika = listaNekretnina.filter(nekretnina => {
            return nekretnina.upiti.some(upit => upit.korisnik_id === korisnik.id);
        });

        return nekretnineSaUpitimaKorisnika.sort((a, b) => b.upiti.length - a.upiti.length);
    }
    
    return {
      init: init,
      prosjecnaKvadratura: prosjecnaKvadratura,
      outlier: outlier,
      mojeNekretnine: mojeNekretnine,
      histogramCijena: histogramCijena,
    };
};