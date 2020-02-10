const puppeteer = require('puppeteer');
const mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "licitacao_user",
  password: "palachinho",
  database: "licitacoes"
});
async function getLicitacoes (url) {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle0'});
  licitacoes = [];
  let a = 0;
  timeout = 5000;
  await page.click('a[href="#tab_licitacoes"]');
  await page.waitFor(500);
  while(a<10){
    let zap = await page.evaluate(() => {
      let data = [];
      let grid = document.querySelector('#PlaceHolder_ucConsultaLicitacoes_Grid');
      let rows = grid.querySelectorAll('tr.border-bottom-dotted');
      for (let i=0;i<rows.length;i++){
          json = {};
          json.modalidade =rows[i].querySelector('a#PlaceHolder_ucConsultaLicitacoes_Grid_lnkModalidade_'+i).textContent;
          let edital = rows[i].querySelector('a#PlaceHolder_ucConsultaLicitacoes_Grid_lnkEdital_'+i).textContent;
          let status = rows[i].querySelector('div.left');
          json.status = status.querySelector('span').textContent;
          let datas = rows[i].querySelector('div#PlaceHolder_ucConsultaLicitacoes_Grid_div_publicado_aux_'+i).querySelectorAll('b');
          json.abertura = datas[0].textContent;
          json.sessao = datas[1].textContent; 
          var reg = /([\s\S]+ -)/g;
          let str = edital.split(reg);
          var reg2 = /\-/g;
          json.descricao = str.pop().trim();
          json.numero_edital = str.pop().replace(reg2,'').trim();
          json.numero_edital = str.pop().replace(reg2,'').trim()+json.numero_edital.trim();
          var reg3 = /([0-9]+)\//g;
          if(json.abertura.includes('de')){
            var reg4 = /([\s\S]+)d/;
          } else {
            var reg4 = /([\s\S]+)\à/;
          }
            
          /* PARTE DO CODIGO REFERENTE A AQUISICAO DA DATA DE ABERTURA */
          let data_abertura = json.abertura.split(reg3);
          json.dia_abertura = parseInt(data_abertura[1]);
          let mes_abertura = data_abertura[2].split(reg4)[1].trim();
          switch (mes_abertura){
            case 'Jan':
              json.mes_abertura = 1;
              break;
            case 'Fev':
              json.mes_abertura = 2;
              break;
            case 'Mar':
              json.mes_abertura = 3;
              break;
            case 'Abr':
              json.mes_abertura = 4;
              break;
            case 'Mai':
              json.mes_abertura = 5;
              break;
            case 'Jun':
              json.mes_abertura = 6;
              break;
            case 'Jul':
              json.mes_abertura = 7;
              break;
            case 'Ago':
              json.mes_abertura = 8;
              break;
            case 'Set':s
              json.mes_abertura = 9;
              break;
            case 'Out':
              json.mes_abertura = 10;
              break;
            case 'Nov':
              json.mes_abertura = 11;
              break;
            case 'Dez':
              json.mes_abertura = 12;
              break;
          }
          json.ano_abertura = parseInt(json.numero_edital.split(reg3)[2].trim());
          let data_sessao = json.sessao.split(reg3);
          json.dia_sessao = parseInt(data_sessao[1]);
          let mes_sessao = data_sessao[2].split(reg4)[1].trim();
          switch (mes_sessao){
            case 'Jan':
              json.mes_sessao = 1;
              break;
            case 'Fev':
              json.mes_sessao = 2;
              break;
            case 'Mar':
              json.mes_sessao = 3;
              break;
            case 'Abr':
              json.mes_sessao = 4;
              break;
            case 'Mai':
              json.mes_sessao = 5;
              break;
            case 'Jun':
              json.mes_sessao = 6;
              break;
            case 'Jul':
              json.mes_sessao = 7;
              break;
            case 'Ago':
              json.mes_sessao = 8;
              break;
            case 'Set':
              json.mes_sessao = 9;
              break;
            case 'Out':
              json.mes_sessao = 10;
              break;
            case 'Nov':
              json.mes_sessao = 11;
              break;
            case 'Dez':
              json.mes_sessao = 12;
              break;
          }
          json.ano_sessao = parseInt(json.numero_edital.split(reg3)[2].trim());
          let datalim = new Date(json.ano_abertura,json.mes_abertura-1,json.dia_abertura);
          let now = new Date();
          if(datalim.getTime() < now.getTime()){
              break;
          }
          data.push(json);
        }
        return data;
      });
      licitacoes = licitacoes.concat(zap);
      a++;
      console.log('navegando pagina : ' + a);
      let s = a.toString();
      await page.click('#PlaceHolder_ucConsultaLicitacoes_lstPaginacao1_lblPag_'+s);
      await page.waitFor(1000);
  }
  console.log(licitacoes);
  await browser.close();
  con.connect((err) => {
        if (err) throw err;
        console.log("Conectado");                    
  });

    for(let i = 0; i< licitacoes.length;i++){
        let sql =  "INSERT INTO licitacoes (codigo) VALUE ('"+licitacoes[i].numero_edital+"')";
        con.query(sql, function (err) {
            if (err) throw err;
            console.log("1 record inserted");
        });
  }

  con.end((err)=>{
    if(err) throw err;
    console.log("Finalizando");
  });
}

module.exports = getLicitacoes;

getLicitacoes('https://www.aracajucompras.se.gov.br/portal/default.aspx');