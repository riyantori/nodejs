console.log("Menyalakan mesin kopi");
console.log("Menggiling biji kopi");
console.log("Memanaskan air");
console.log("Mencampurkan air dan kopi");
console.log("Menuangkan kopi ke dalam gelas");
console.log("Menuangkan susu ke dalam gelas");
console.log("Kopi Anda sudah siap!");

const coffeeStock = require('./state')

const makeCoffee = (type, miligram) => {
    if(coffeeStock[type] >= miligram) {
        console.log(`Kopi ${type} berhasil dibuat!`);
    }else {
        console.log(`Biji kopi ${type} habis!`)
    }
}

makeCoffee("robusta", 80)