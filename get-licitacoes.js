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
    let grid = document.querySelector('#PlaceHolder_ucConsultaLicitacoes_Grid');
    let rows = grid.querySelectorAll('tr.gridrowinner-white.border-bottom-dotted');
    for (let i=0;i<rows.length;i++){
        json = {};
        json.modalidade =rows[i].querySelector('a#PlaceHolder_ucConsultaLicitacoes_Grid_lnkModalidade_'+i).textContent;
        let edital = rows[i].querySelector('a#PlaceHolder_ucConsultaLicitacoes_Grid_lnkEdital_'+i).textContent;

        var reg = /([\s\S]+ -)/g;
        let str = edital.split(reg);
        var reg2 = /\-/g;
        json.descricao = str.pop().trim();
        json.numero_edital = str.pop().replace(reg2,'').trim();
        json.numero_edital = str.pop().replace(reg2,'').trim()+json.numero_edital;
        
        data.push(json);
    }
    return data;
  });
  console.log(texts);
  html = await page.content();
  await browser.close();
 
  return html;
}

main(url);