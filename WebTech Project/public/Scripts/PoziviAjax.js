const PoziviAjax = (() => {

    function ajaxRequest(method, url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(null, xhr.responseText);
                } else {
                    callback({ status: xhr.status, statusText: xhr.statusText }, null);
                }
            }
        };
        xhr.send(data ? JSON.stringify(data) : null);
    }
    function impl_getKorisnik(fnCallback) {
        let ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    console.log('Uspješan zahtjev, status 200');
                    fnCallback(null, JSON.parse(ajax.responseText));
                } else if (ajax.status == 401) {
                    console.log('Neuspješan zahtjev, status 401');
                    fnCallback("error", null);
                } else {
                    console.log('Nepoznat status:', ajax.status);
                }
            }
        };

        ajax.open("GET", "http://localhost:3000/korisnik/", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send();
    }

    function impl_putKorisnik(noviPodaci, fnCallback) {
        if (!req.session.username) {
            return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
        }

        const { ime, prezime, username, password } = noviPodaci;

        const users = readJsonFile('korisnici');

        const loggedInUser = users.find((user) => user.username === req.session.username);

        if (!loggedInUser) {
            return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
        }

        if (ime) loggedInUser.ime = ime;
        if (prezime) loggedInUser.prezime = prezime;
        if (username) loggedInUser.adresa = adresa;
        if (password) loggedInUser.brojTelefona = brojTelefona;

        saveJsonFile('korisnici', users);

        fnCallback(null, { poruka: 'Podaci su uspješno ažurirani' });
    }

    function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        const data = {
            nekretnina_id,
            tekst_upita,
          };

          const xhr = new XMLHttpRequest();
          xhr.open('POST', 'http://localhost:3000/upit');
          xhr.setRequestHeader('Content-Type', 'application/json');
          
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                fnCallback(null, JSON.parse(xhr.responseText));
              } else {
                fnCallback({ status: xhr.status, statusText: xhr.statusText }, null);
              }
            }
          };
        
          xhr.send(JSON.stringify(data));
    }

    function impl_getNekretnine(fnCallback) {
        ajaxRequest('GET', '/nekretnine', null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_postLogin(username, password, fnCallback) {
        var ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/login", true)
        ajax.setRequestHeader("Content-Type", "application/json")
        var objekat = {
            "username": username,
            "password": password
        }
        forSend = JSON.stringify(objekat)
        ajax.send(forSend)
    }

    function impl_postLogout(fnCallback) {
        let ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/logout", true)
        ajax.send()
    }
    
    function impl_getMojiUpiti(fnCallback) {
        ajaxRequest('GET', '/upiti/moji', null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    console.log(data);
                    const korisnikoviUpiti = JSON.parse(data);
                    fnCallback(null, korisnikoviUpiti);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_getNekretnina(nekretnina_id, fnCallback) {
        console.log(`Poziv za nekretninu sa ID-om: ${nekretnina_id}`);
        const url = `/nekretnina/${nekretnina_id}`;
        
        ajaxRequest('GET', url, null, (error, data) => {
            if (error) {
                console.error("Greška prilikom slanja GET zahtjeva:", error);
                fnCallback(error, null);
                return;
            }
    
            console.log("Odgovor sa servera za nekretninu ID:", nekretnina_id);
            if (data) {
                try {
                    const nekretnina = JSON.parse(data);
                    console.log("Podaci o nekretnini uspješno parsirani:", nekretnina);
                    fnCallback(null, nekretnina); 
                } catch (parseError) {
                    console.error("Greška pri parsiranju podataka:", parseError);
                    fnCallback(parseError, null); 
                }
            } else {
                console.error("Prazan odgovor od servera za nekretninu ID:", nekretnina_id);
                fnCallback("Prazan odgovor", null);
            }
        });
 
    }

    function impl_getTop5Nekretnina(lokacija, callback) {
        const url = `/nekretnine/top5?lokacija=${encodeURIComponent(lokacija)}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP greška! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => callback(null, data))
            .catch(error => callback(error, null));
        }

        function impl_getNextUpiti(nekretnina_id, page, fnCallback) {
            console.log(`Dohvaćanje upita za nekretninu ID: ${nekretnina_id}, stranica: ${page}`);
            const url = `/next/upiti/nekretnina/${nekretnina_id}?page=${encodeURIComponent(page)}`;
        
            ajaxRequest('GET', url, null, (error, data) => {
                if (error) {
                    console.error("Greška prilikom slanja GET zahtjeva za upite:", error);
                    fnCallback(error, null);
                    return;
                }
        
                console.log("Odgovor sa servera za upite nekretnine ID:", nekretnina_id);
                if (data) {
                    try {
                        const upitiZaPage = JSON.parse(data);
                        console.log("Podaci o upitima uspješno parsirani:", upitiZaPage);
                        fnCallback(null, upitiZaPage);
                    } catch (parseError) {
                        console.error("Greška pri parsiranju podataka za upite:", parseError);
                        fnCallback(parseError, null);
                    }
                } else {
                    console.error("Prazan odgovor od servera za upite nekretnine ID:", nekretnina_id);
                    fnCallback("Prazan odgovor", null);
                }
            });
        }

        function impl_getInteresovanja(nekretninaId, fnCallback) {
            const url = `http://localhost:3000/nekretnina/${nekretninaId}/interesovanja`;
            ajaxRequest('GET', url, null, (error, data) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const interesovanja = JSON.parse(data);
                        fnCallback(null, interesovanja);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }

        function impl_postPonuda(nekretninaId, tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda, fnCallback) {
            const url = `http://localhost:3000/nekretnina/${nekretninaId}/ponuda`;
            const data = {
                tekst: tekst,
                ponudaCijene: ponudaCijene,
                datumPonude: datumPonude,
                idVezanePonude: idVezanePonude,
                odbijenaPonuda: odbijenaPonuda
            };
            ajaxRequest('POST', url, data, (error, response) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const ponuda = JSON.parse(response);
                        fnCallback(null, ponuda);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }

        function impl_getLinkedPonude(nekretninaId, fnCallback) {
            const url = `http://localhost:3000/ponude/${nekretninaId}`;
            
            ajaxRequest('GET', url, null, (error, response) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const ponude = JSON.parse(response);
                        fnCallback(null, ponude);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }

        function impl_postZahtjev(nekretninaId, tekst, trazeniDatum, fnCallback) {
            const url = `http://localhost:3000/nekretnina/${nekretninaId}/zahtjev`;
            console.log(url);
            console.log("FINO FINO", trazeniDatum);
            const data = {
                tekst: tekst,
                trazeniDatum: trazeniDatum // Osiguraj da je datum u formatu YYYY-MM-DD
            };
            ajaxRequest('POST', url, data, (error, response) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const zahtjev = JSON.parse(response);
                        fnCallback(null, zahtjev);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }
    
        function impl_putZahtjev(nekretninaId, zahtjevId, odobren, addToTekst, fnCallback) {
            const url = `http://localhost:3000/nekretnina/${nekretninaId}/zahtjev/${zahtjevId}`;
            const data = {
                odobren: odobren,
                addToTekst: addToTekst
            };
            ajaxRequest('PUT', url, data, (error, response) => {
                if (error) {
                    fnCallback(error, null);
                } else {
                    try {
                        const zahtjev = JSON.parse(response);
                        fnCallback(null, zahtjev);
                    } catch (parseError) {
                        fnCallback(parseError, null);
                    }
                }
            });
        }
        
    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        getNekretnine: impl_getNekretnine,
        getMojiUpiti: impl_getMojiUpiti,
        getTop5Nekretnina: impl_getTop5Nekretnina,
        getNekretnina: impl_getNekretnina,
        getNextUpiti: impl_getNextUpiti,
        getInteresovanja: impl_getInteresovanja,
        postPonuda: impl_postPonuda,
        getLinkedPonude: impl_getLinkedPonude,
        postZahtjev: impl_postZahtjev,
        putZahtjev: impl_putZahtjev
    };
})();