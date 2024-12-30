const regexDate = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

function validateDate(input) {
    if (!regexDate.test(input)) {
        return false;
    }

    const [day, month, year] = input.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

console.log(validateDate("01-12-2024")); 
console.log(validateDate("31-02-2024"));
console.log(validateDate("31-13-2024")); 
console.log(validateDate("29-02-2020")); 

