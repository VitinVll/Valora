/* Pagamento online (AbacatePay): a chave fica no servidor (variável de ambiente). */
const Pagamento={async iniciar(p){
  const r=await fetch('/api?r=cobranca',{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'fetch'},body:JSON.stringify({pedidoId:p.id})});
  if(!r.ok)throw new Error('Gateway indisponível');return r.json()}};
