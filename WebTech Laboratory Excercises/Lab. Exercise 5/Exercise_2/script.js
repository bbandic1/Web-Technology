let brojackiObjekat = (function () {
    let brojac = 0;

    return {
        dodaj: function () {
            return ++brojac; 
        },
        resetuj: function () {
            brojac = 0; 
            return brojac;
        }
    };
})();

console.log(brojackiObjekat.dodaj()); 
console.log(brojackiObjekat.dodaj()); 
console.log(brojackiObjekat.resetuj());
console.log(brojackiObjekat.dodaj()); 