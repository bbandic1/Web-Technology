window.onload = function () {
    function popuniProfilPodatke(korisnik) {
        if (korisnik) {
            const imeField = document.querySelector('input[placeholder="Unesite ime"]');
            const prezimeField = document.querySelector('input[placeholder="Unesite prezime"]');
            const usernameField = document.querySelector('input[placeholder="Unesite username"]');
            const passwordField = document.querySelector('input[placeholder="Unesite lozinku"]');

            imeField.value = korisnik.ime || '';
            prezimeField.value = korisnik.prezime || '';
            usernameField.value = korisnik.username || '';
            passwordField.value = korisnik.password || '';
        } else {
            console.error("Korisnički podaci nisu dostupni.");
        }
    }

    PoziviAjax.getKorisnik(function (err, data) {
        if (err || !data) {
            console.error("Greška prilikom dohvata korisničkih podataka:", err);
            return;
        }
        popuniProfilPodatke(data);
    });
};
