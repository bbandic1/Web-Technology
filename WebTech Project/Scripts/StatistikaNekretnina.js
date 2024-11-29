let StatistikaNekretnina = function () {

    let listaNekretnina = [];
    let listaKorisnika = [];

    let spisakNekretnina = new SpisakNekretnina();

    let init = function (listaNekretnina, listaKorisnika) {
        spisakNekretnina.init(listaNekretnina, listaKorisnika);
        this.listaNekretnina = spisakNekretnina.listaNekretnina;
        this.listaKorisnika = spisakNekretnina.listaKorisnika;
    };

    let prosjecnaKvadratura = function (kriterij) {
        const filtriraneNekretnine = spisakNekretnina.filtrirajNekretnine(kriterij);
        if (filtriraneNekretnine.length === 0) {
            return 0; 
        }
        const sumaKvadratura = filtriraneNekretnine.reduce(
            (suma, nekretnina) => suma + nekretnina.kvadratura,
            0
        );
        return sumaKvadratura / filtriraneNekretnine.length;
    };

    let outlier = function (kriterij, nazivSvojstva) {
        const filtriraneNekretnine = spisakNekretnina.filtrirajNekretnine(kriterij);
    
        if (filtriraneNekretnine.length === 0) {
            return null; 
        }

        const suma = filtriraneNekretnine.reduce((total, nekretnina) => total + nekretnina[nazivSvojstva], 0);
        const prosjek = suma / filtriraneNekretnine.length;
    
        return filtriraneNekretnine.reduce((najveciOutlier, nekretnina) => {
            const odstupanje = Math.abs(nekretnina[nazivSvojstva] - prosjek);
            return odstupanje > najveciOutlier.odstupanje
                ? { nekretnina, odstupanje }
                : najveciOutlier;
        }, { nekretnina: null, odstupanje: 0 }).nekretnina;
    };

    let mojeNekretnine = function (korisnik) {
        console.log(this.listaKorisnika)
        console.log(this.listaNekretnina)
        const nekretnineSaUpitomKorisnika = this.listaNekretnina.filter(nekretnina => 
            nekretnina.upiti.some(upit => upit.korisnik_id === korisnik.id)
        );
    
        return nekretnineSaUpitomKorisnika.sort((a, b) => b.upiti.length - a.upiti.length);
    };

    let histogramCijena = function (periodi, rasponiCijena) {
        return periodi.flatMap((period, periodIndex) => {
            return rasponiCijena.map((raspon, rasponIndex) => {
                
                const filtriraneNekretnine = listaNekretnina.filter(nekretnina => 
                    nekretnina.godina_objave >= period.od &&
                    nekretnina.godina_objave <= period.do &&
                    nekretnina.cijena >= raspon.od &&
                    nekretnina.cijena <= raspon.do
                );
    
                console.log(`Period (${period.od}-${period.do}), Raspon (${raspon.od}-${raspon.do}):`, filtriraneNekretnine);
    
                return {
                    indeksPerioda: periodIndex,
                    indeksRasponaCijena: rasponIndex,
                    brojNekretnina: filtriraneNekretnine.length
                };
            });
        });
    };
    
    return {
      init: init,
      prosjecnaKvadratura: prosjecnaKvadratura,
      outlier: outlier,
      mojeNekretnine: mojeNekretnine,
      histogramCijena: histogramCijena,
    };
};