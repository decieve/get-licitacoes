const get = require('./get-licitacoes');
const mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "licitacao_user",
    password: "Q%AQ^%OyXZHs5*if0hO6",
    database: "licitacoes"
});



function get_codigo (codigo,callback){
    let sql_reconhecimento = " SELECT codigo FROM licitacoes WHERE codigo = '"+codigo+"'";
    con.query(sql_reconhecimento,(err,results)=>{
      if (err) throw err;
      if (results.length > 0){
        console.log(results[0].codigo);
        callback(results[0].codigo);  
      } else
        callback(undefined);
    });
}
async function whats(end){
    let licitacoes = await get('https://www.aracajucompras.se.gov.br/portal/default.aspx');
   for(let i = 0; i< licitacoes.length;i++){
        get_codigo(licitacoes[i].numero_edital,function(result){
            if(result == licitacoes[i].numero_edital){
                let sql = "UPDATE licitacoes SET situacao = '"+licitacoes[i].status+
                    "',descricao ='"+licitacoes[i].descricao+
                    "',modalidade = '"+licitacoes[i].modalidade+
                    "',data_abertura = "+con.escape(new Date(licitacoes[i].ano_abertura,licitacoes[i].mes_abertura-1,licitacoes[i].dia_abertura))+
                    ",data_sessao = "+con.escape(new Date(licitacoes[i].ano_sessao,licitacoes[i].mes_sessao-1,licitacoes[i].dia_sessao))+
                    " WHERE codigo = '"+licitacoes[i].numero_edital+"'";
                con.query(sql, function (err) {
                    if (err) throw err;
                    console.log("1 record updated");
                 });
            }else{
                let sql =  "INSERT INTO licitacoes (codigo,situacao,descricao,modalidade,data_abertura,data_sessao) VALUES ('"+licitacoes[i].numero_edital+"','"+licitacoes[i].status+"','"+licitacoes[i].descricao+"','"+licitacoes[i].modalidade+"',"+con.escape(new Date(licitacoes[i].ano_abertura,licitacoes[i].mes_abertura-1,licitacoes[i].dia_abertura))+","+con.escape(new Date(licitacoes[i].ano_sessao,licitacoes[i].mes_sessao-1,licitacoes[i].dia_sessao))+")";
                con.query(sql, function (err) {
                    if (err) throw err;
                    console.log("1 record inserted");
                });
        }
        }); 
    }
    end()
}

( async ()=>{
        whats(()=>{
            con.end();
        });

    }
)();
