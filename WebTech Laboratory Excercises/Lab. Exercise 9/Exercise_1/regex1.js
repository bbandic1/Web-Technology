const regex1 = /^\d+_[a-zA-Z]{2,}$/;

console.log(regex1.test("123_abc")); 
console.log(regex1.test("123_"));    