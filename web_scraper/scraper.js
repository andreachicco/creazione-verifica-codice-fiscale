const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');


async function getHtml(URL) {

    const response = await axios.get(URL);
    const html = await response.data;
    
    return html;
}

function getListaComuni(pageHtml) { 
    const $ = cheerio.load(pageHtml);
    
    const comuni = $('tbody').find('tr').text().trim();

    //Split ad ogni linea vuota
    const infoComuni = comuni.split(/[\n\r]+/g);

    const  listaComuni = [];
    for(let i = 3; i < infoComuni.length; i += 3) {
        const comune = {
            nome: infoComuni[i], 
            provincia: infoComuni[i + 1],
            codice: infoComuni[i + 2]
        };

        listaComuni.push(comune);
    } 

    return listaComuni;
}

async function writeDataInFile(fileName, data) {
    try {
        await fs.writeFileSync(fileName, JSON.stringify(data));
        console.log('Operazione svolta con successo');
    } catch (error) {
        console.error(error);
    }
}

async function init() { 
    const URL = 'https://www.misterfisco.it/i-codici-catastali-dei-comuni-in-ordine-alfabetico-per-comune/';
    
    const pageHtml = await getHtml(URL);
    const listaComuni = getListaComuni(pageHtml);
    writeDataInFile('../comuni.json', listaComuni);
}

init()