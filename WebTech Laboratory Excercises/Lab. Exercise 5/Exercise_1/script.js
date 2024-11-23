function dodajDva(broj) {
    return broj + 2;
}

function jednom(callback) {
    let rezultat; 
    let pozvano = false; 

    return function (parametar) {
        if (!pozvano) {
            rezultat = callback(parametar); 
            pozvano = true; 
        }
        return rezultat; 
    };
}

const jednomFunkcija = jednom(dodajDva);

console.log(jednomFunkcija(4)); 
console.log(jednomFunkcija(10)); 
console.log(jednomFunkcija(9001));