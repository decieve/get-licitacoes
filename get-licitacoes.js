const puppeteer = require('puppeteer');

// URL do site
var url = 'https://www.aracajucompras.se.gov.br/portal/'

async function main (url) {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle0'});
  await page.setRequestInterception(true);
  // OTIMIZAR TEMPO DE ENTRADA
  page.on('request', (req) => {
      if( req.resourceType() !== 'document'){
          req.abort();
      }
      else {
          req.continue();
      }
    });
  let licitacoes = [];

  let texts = await page.evaluate(() => {
    let data = [];
    let i = 0;
    let elements = document.querySelectorAll('tr.gridrowinner-white border-bottom-dotted');
    elements.forEach((element,i) =>{
        json = {};
        try{
             json.modalidade = element.querySelector('PlaceHolder_ucConsultaLicitacoes_Grid_lnkModalidade_'+i).textContent;
             let edital = element.querySelector('PlaceHolder_ucConsultaLicitacoes_Grid_lnkEdital_'+i).textContent;
            
        }catch(exception){
            
        }
    });
    return elements;
  });
  console.log(texts);
  html = await page.content();
  await browser.close();
 
  return html;
}

main(url);