
function getStringLetters(string) {
    return string.split('');
}

function getFilledArray(array, start = 0, end = array.length) {
    array.length = end;
    const filledSurname = surnameLetters.fill('x', start, end); 
    return filledSurname.join('');   
}

async function getTownFromFile(inputTown, fileName){

    try {
        const response = await fetch(fileName);
        const towns = await response.json();

        const selectedTown = towns.find(town => town.nome.toLowerCase() === inputTown.toLowerCase() || town.codice.toLowerCase() === inputTown.toLowerCase());

        return selectedTown;
    }
    catch(err) {
        console.err(err);
    }
}

const vowels = ['a', 'e', 'i', 'o', 'u'];
const monthLetters = ['a', 'b', 'c', 'd', 'e', 'h', 'l', 'm', 'p', 'r', 's', 't'];

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

const alphanumericChars = {
    odd: {
        '0': 1,
        '1': 0,
        '2': 5,
        '3': 7,
        '4': 9,
        '5': 13,
        '6': 15,
        '7': 17,
        '8': 19,
        '9': 21,
        'a': 1,
        'b': 0,
        'c': 5,
        'd': 7,
        'e': 9,
        'f': 13,
        'g': 15,
        'h': 17,
        'i': 19,
        'j': 21,
        'k': 2,
        'l': 4,
        'm': 18,
        'n': 20,
        'o': 11,
        'p': 3,
        'q': 6,
        'r': 8,
        's': 12,
        't': 14,
        'u': 16,
        'v': 10,
        'w': 22,
        'x': 25,
        'y': 24,
        'z': 23
    },
    even: {
        '0': 0,
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        'a': 0,
        'b': 1,
        'c': 2,
        'd': 3,
        'e': 4,
        'f': 5,
        'g': 6,
        'h': 7,
        'i': 8,
        'j': 9,
        'k': 10,
        'l': 11,
        'm': 12,
        'n': 13,
        'o': 14,
        'p': 15,
        'q': 16,
        'r': 17,
        's': 18,
        't': 19,
        'u': 20,
        'v': 21,
        'w': 22,
        'x': 23,
        'y': 24,
        'z': 25
    }
}

class CodiceFiscale {

    #generateCodeSName(name, isSurname = false) {
        const nameLetters = getStringLetters(name);

        //Controllo che il nome non abbia già meno di 3 caratteri
        if(nameLetters.length < 3) return getFilledArray(nameLetters, nameLetters.length, 3);

        //Solo consonanti, solo vocali
        const onlyConsonant = nameLetters.filter(letter => !vowels.includes(letter.toLowerCase()));
        const onlyVowel = nameLetters.filter(letter => vowels.includes(letter.toLowerCase()));

        const generatedName = onlyConsonant;
        const consonantNumber = onlyConsonant.length;

        const checkNumber = isSurname ? 3 : 4;
        //Se le consonanti sono più di checkNumber, ridimensiona array
        if(consonantNumber > checkNumber) {
            if(!isSurname) generatedName.splice(1, 2);
            generatedName.length = 3;
        }

        //Se sono 2
        if(consonantNumber === 2) generatedName.push(onlyVowel[0]);

        return generatedName.join('');
    }

    #calculateLastLetter(code) {
        let total = 0;
        code.split('').forEach((letter, index) => {

            if((index + 1) % 2 === 0) total += alphanumericChars.even[letter];
            else total += alphanumericChars.odd[letter];
        });

        return total % 26 < alphabet.length ? alphabet[total % 26] : alphabet[(total % 26) - 1];
    }

    async generateCode(userData) {

        //Cognome, Nome
        const surname = this.#generateCodeSName(userData.surname, true);
        const name = this.#generateCodeSName(userData.name);

        //Data
        const date = userData.birthDate.split('-');

        const year = date[0].slice(2, 5);
        const monthLetter = monthLetters[parseInt(date[1]) - 1];
        const day = userData.sex === 'm' ? date[2] : parseInt(date[2]) + 40;

        //Codice Comune
        const town = await getTownFromFile(userData.town, './comuni.json');

        if(!town) {
            alert('Inserire comune valido!');
            return;
        } 
    
        const townCode = town.codice;

        let code = `${surname}${name}${year}${monthLetter}${day}${townCode}`;
        const checkChar = this.#calculateLastLetter(code.toLowerCase());

        code += checkChar;

        return code.toUpperCase();
    }

    #isValidName(name) {
        //Convalida Cognome e Nome
        const namePattern = /\d/; 
        return !(namePattern.test(name));
    }

    #isValidYear(year) {
        //Convalida anno di nascita
        return !isNaN(year);
    }

    #isValidMonthLetter(letter) {
        return monthLetters.includes(letter);
    }

    #isBirthDayValid(day) {
        return !isNaN(day) && (day > 0 && day <= 71);
    }

    async #isTownCodeValid(code) {
        const town = await getTownFromFile(code, './comuni.json');
        
        return !!(town);
    }

    async validateCode(code) {

        if(code.length !== 16) return false;

        const name = code.substring(0, 6);
        const isValidName = this.#isValidName(name);

        const birthYear = code.substring(6, 8);
        const isValidYear = this.#isValidYear(birthYear);

        const monthLetter = code.substring(8, 9);
        const isMonthLetterValid = this.#isValidMonthLetter(monthLetter);

        const birthDay = code.substring(9, 11);
        const isBirthDayValid = this.#isBirthDayValid(birthDay);

        const townCode = code.substring(11, 15);
        const isTownCodeValid = await this.#isTownCodeValid(townCode);

        const checkLetter = this.#calculateLastLetter(code.substring(0, code.length - 1));

        return (isValidName && isValidYear && isMonthLetterValid && isBirthDayValid && isTownCodeValid && checkLetter === code[code.length - 1]);
    }
}

export default CodiceFiscale;