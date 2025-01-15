const nekretninaData = [
    {
      "id": 1,
      "tip_nekretnine": "Stan 1",
      "naziv": "Useljiv stan Sarajevo",
      "kvadratura": 58,
      "cijena": 232000,
      "tip_grijanja": "plin",
      "lokacija": "Novo Sarajevo",
      "godina_izgradnje": 2019,
      "datum_objave": "01.10.2023.",
      "opis": "Sociis natoque penatibus.",
      "upiti": [
        {
          "korisnik_id": 1,
          "tekst_upita": "Nullam eu pede mollis pretium."
        },
        {
          "korisnik_id": 2,
          "tekst_upita": "Phasellus viverra nulla."
        }
      ]
    },
    {
      "id": 2,
      "tip_nekretnine": "Stan 2",
      "naziv": "Useljiv stan Sarajevo",
      "kvadratura": 58,
      "cijena": 32000,
      "tip_grijanja": "plin",
      "lokacija": "Novo Sarajevo",
      "godina_izgradnje": 2019,
      "datum_objave": "01.10.2009.",
      "opis": "Sociis natoque penatibus.",
      "upiti": [
        {
          "korisnik_id": 1,
          "tekst_upita": "Nullam eu pede mollis pretium."
        },
        {
          "korisnik_id": 2,
          "tekst_upita": "Phasellus viverra nulla."
        }
      ]
    },
    {
      "id": 3,
      "tip_nekretnine": "Stan 3",
      "naziv": "Useljiv stan Sarajevo",
      "kvadratura": 58,
      "cijena": 232000,
      "tip_grijanja": "plin",
      "lokacija": "Novo Sarajevo",
      "godina_izgradnje": 2019,
      "datum_objave": "01.10.2003.",
      "opis": "Sociis natoque penatibus.",
      "upiti": [
        {
          "korisnik_id": 1,
          "tekst_upita": "Nullam eu pede mollis pretium."
        },
        {
          "korisnik_id": 2,
          "tekst_upita": "Phasellus viverra nulla."
        }
      ]
    },
    {
      "id": 4,
      "tip_nekretnine": "Kuća 1",
      "naziv": "Mali poslovni prostor",
      "kvadratura": 20,
      "cijena": 70000,
      "tip_grijanja": "struja",
      "lokacija": "Centar",
      "godina_izgradnje": 2005,
      "datum_objave": "20.08.2023.",
      "opis": "Magnis dis parturient montes.",
      "upiti": [
        {
          "korisnik_id": 2,
          "tekst_upita": "Integer tincidunt."
        }
      ]
    },
    {
      "id": 5,
      "tip_nekretnine": "Kuća 2",
      "naziv": "Mali poslovni prostor",
      "kvadratura": 20,
      "cijena": 70000,
      "tip_grijanja": "struja",
      "lokacija": "Centar",
      "godina_izgradnje": 2005,
      "datum_objave": "20.08.2023.",
      "opis": "Magnis dis parturient montes.",
      "upiti": [
        {
          "korisnik_id": 2,
          "tekst_upita": "Integer tincidunt."
        }
      ]
    },
    {
      "id": 6,
      "tip_nekretnine": "Kuća 3",
      "naziv": "Mali poslovni prostor",
      "kvadratura": 20,
      "cijena": 70000,
      "tip_grijanja": "struja",
      "lokacija": "Centar",
      "godina_izgradnje": 2005,
      "datum_objave": "20.08.2023.",
      "opis": "Magnis dis parturient montes.",
      "upiti": [
        {
          "korisnik_id": 2,
          "tekst_upita": "Integer tincidunt."
        }
      ]
    }
  ]
  
  document.addEventListener('DOMContentLoaded', function() {
    const stanList = document.getElementById('stan-lista');
    nekretninaData.filter(item => item.tip_nekretnine.startsWith('Stan')).forEach(item => {
        const div = document.createElement('div');
        div.classList.add('nekretnina');
        
        div.innerHTML = `
            <img class="slika-nekretnine" src="../Resources/Stan/Stan1.jpg" alt="${item.naziv}">
            <div class="detalji-nekretnine">
                <h3>${item.tip_nekretnine}</h3>
                <p>Kvadratura: ${item.kvadratura} m²</p>
            </div>
            <div class="cijena-nekretnine">
                <p>Cijena: ${item.cijena} €</p>
            </div>
            <a href="detalji.html?id=${item.id}" class="detalji-dugme">Detalji</a>
        `;
        stanList.appendChild(div);
    });

    const kucaList = document.getElementById('kuca-lista');
    nekretninaData.filter(item => item.tip_nekretnine.startsWith('Kuća')).forEach(item => {
        const div = document.createElement('div');
        div.classList.add('nekretnina');
        
        div.innerHTML = `
            <img class="slika-nekretnine" src="../Resources/Kuca/Kuca1.jpg" alt="${item.naziv}">
            <div class="detalji-nekretnine">
                <h3>${item.tip_nekretnine}</h3>
                <p>Kvadratura: ${item.kvadratura} m²</p>
            </div>
            <div class="cijena-nekretnine">
                <p>Cijena: ${item.cijena} €</p>
            </div>
            <a href="detalji.html?id=${item.id}" class="detalji-dugme">Detalji</a>
        `;
        kucaList.appendChild(div);
    });

    const ppList = document.getElementById('pp-lista');
    nekretninaData.filter(item => item.tip_nekretnine === 'Poslovni prostor').forEach(item => {
        const div = document.createElement('div');
        div.classList.add('nekretnina');
        
        div.innerHTML = `
            <img class="slika-nekretnine" src="../Resources/PP/pp1.jpg" alt="${item.naziv}">
            <div class="detalji-nekretnine">
                <h3>${item.tip_nekretnine}</h3>
                <p>Kvadratura: ${item.kvadratura} m²</p>
            </div>
            <div class="cijena-nekretnine">
                <p>Cijena: ${item.cijena} €</p>
            </div>
            <a href="detalji.html?id=${item.id}" class="detalji-dugme">Detalji</a>
        `;
        ppList.appendChild(div);
    });
});