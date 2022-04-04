import CodiceFiscale from "./codiceFiscale.js";

function isEmpty(obj) {

    if(!obj) return true;
    
    for(const property in obj) {
        if(!obj[property]) return true;
    }

    return false;
}

function isValidData(userData) {

    const pattern = /\d/;

    return !(pattern.test(userData.surname) || pattern.test(userData.name) || pattern.test(userData.town) || pattern.test(userData.province));
}

function getUserFormData() {
    const surnameInput = document.querySelector('#surname');
    const nameInput = document.querySelector('#name');
    const birthDateInput = document.querySelector('#birth-date');
    const sexInput = document.querySelector('#sex');
    const townInput = document.querySelector('#town');
    const provinceInput = document.querySelector('#province');

    const userData = {
        surname: surnameInput.value.trim(),
        name: nameInput.value.trim(),
        birthDate: birthDateInput.value.trim(),
        sex: sexInput.value,
        town: townInput.value.trim(),
        province: provinceInput.value.trim()
    }

    const isValid = isValidData(userData)

    if(isValid) return userData;
    else alert('Inserire un formato valido');
}

function init() {
    const form = document.querySelector('.insert-form');
    form.addEventListener('submit', async (e) => {
        
        e.preventDefault();
        
        const userData = getUserFormData();
        
        if(isEmpty(userData)) alert('Per favore, inserire tutti i campi');
        else {
            const cf = new CodiceFiscale();
            const newCode = await cf.generateCode(userData);  
            
            const output = document.querySelector('.output');
            output.innerText = newCode;
        }
    });
}

init();