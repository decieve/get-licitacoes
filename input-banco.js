const get = require('./get-licitacoes');
const mysql = require('mysql');
const senhabanco = require('./senhabanco');
var con = mysql.createConnection({
    host: "localhost",
    user: "licitacao_user",
    password: senhabanco,
    database: "licitacoes"
 });
  function get_codigo (codigo) {
    let sql_reconhecimento = " SELECT codigo FROM licitacoes WHERE codigo = '"+codigo+"'";    
      return new Promise((resolve, reject) => {
        con.query(sql_reconhecimento,(err,results)=>{
          if (err) {
            return reject(err);
          }
          if (results.length > 0){
            console.log(results[0].codigo);
            return resolve(results[0].codigo);  
          } else {
            return resolve(undefined);
          }
      })
    });
  }
  function salvarLicitacao(licitacao, codigo) {
    return new Promise((resolve, reject) => {
      if(codigo == licitacao.numero_edital){
        let sql = "UPDATE licitacoes SET situacao = '"+licitacao.status+
            "',descricao ='"+licitacao.descricao+
            "',modalidade = '"+licitacao.modalidade+
            "',data_abertura = "+con.escape(new Date(licitacao.ano_abertura,licitacao.mes_abertura-1,licitacao.dia_abertura))+
            ",data_sessao = "+con.escape(new Date(licitacao.ano_sessao,licitacao.mes_sessao-1,licitacao.dia_sessao))+
            " WHERE codigo = '"+licitacao.numero_edital+"'";
        con.query(sql, function (err) {
            if (err) {
              return reject(err);
            }
            resolve("1 record updated")
        });
      }else{
          let sql =  "INSERT INTO licitacoes (codigo,situacao,descricao,modalidade,data_abertura,data_sessao) VALUES ('"+licitacao.numero_edital+"','"+licitacao.status+"','"+licitacao.descricao+"','"+licitacao.modalidade+"',"+con.escape(new Date(licitacao.ano_abertura,licitacao.mes_abertura-1,licitacao.dia_abertura))+","+con.escape(new Date(licitacao.ano_sessao,licitacao.mes_sessao-1,licitacao.dia_sessao))+")";
          con.query(sql, function (err) {
              if (err) throw err;
              resolve("1 record inserted")
          });
      }
    })
  }
 async function whats(end){
    let licitacoes = await get('https://www.aracajucompras.se.gov.br/portal/default.aspx');
    const promisses =[]
   for(let i = 0; i< licitacoes.length;i++){
        const licitacao = licitacoes[i]
        const promisse =  get_codigo(licitacao.numero_edital)
        .then((codigo)=>{
          return salvarLicitacao(licitacao,codigo).catch((reject)=>{
              console.log(reject);
          })
        })
        promisses.push(promisse)
    }
    Promise.all(promisses).then(function() {
      end()
    });
 }
 ( ()=>{
        whats(()=>con.end());
    }
 )();