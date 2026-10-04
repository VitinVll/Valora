// Backend da loja para a Vercel (função serverless Node). Banco: Upstash Redis via REST. Fotos: Vercel Blob.
const crypto=require('crypto');
const envf=re=>{const k=Object.keys(process.env).find(k=>re.test(k)&&process.env[k]);return k?process.env[k]:''};
const U=envf(/(KV_REST_API_URL|UPSTASH_REDIS_REST_URL)$/),T=envf(/(KV_REST_API_TOKEN|UPSTASH_REDIS_REST_TOKEN)$/);
const SECRET=process.env.SESSION_SECRET||T||'';
const rd=async a=>{const r=await fetch(U,{method:'POST',headers:{Authorization:'Bearer '+T},body:JSON.stringify(a)});const j=await r.json();if(j.error)throw new Error(j.error);return j.result};
const kv=async(k,d=null)=>{const v=await rd(['GET','loja:'+k]);return v==null?d:JSON.parse(v)};
const kvs=(k,v)=>rd(['SET','loja:'+k,JSON.stringify(v)]);
async function lock(){for(let i=0;i<40;i++){if(await rd(['SET','loja:lock','1','NX','EX','10']))return;await new Promise(r=>setTimeout(r,150))}throw new Error('Servidor ocupado. Tente de novo.')}
const unlock=()=>rd(['DEL','loja:lock']);
const s=(v,n=120)=>String(v??'').replace(/<[^>]*>/g,'').trim().slice(0,n);
const preco=p=>p.desc>0?+(p.preco*(1-p.desc/100)).toFixed(2):+p.preco;
// senha (scrypt) e sessão (cookie assinado)
const hash=p=>{const sa=crypto.randomBytes(16).toString('hex');return sa+':'+crypto.scryptSync(p,sa,32).toString('hex')};
const check=(p,h)=>{const[sa,x]=h.split(':');const y=crypto.scryptSync(p,sa,32);return crypto.timingSafeEqual(y,Buffer.from(x,'hex'))};
const sig=x=>crypto.createHmac('sha256',SECRET).update(x).digest('hex');
const isAdmin=req=>{const m=/(?:^|;\s*)adm=(\d+)\.([a-f0-9]+)/.exec(req.headers.cookie||'');if(!m||+m[1]<Date.now())return false;const a=Buffer.from(sig(m[1])),b=Buffer.from(m[2]);return a.length===b.length&&crypto.timingSafeEqual(a,b)};
const SEED=[{id:1,nome:'Nimbus X 15K',cat:'Descartável',preco:129.9,estoque:24,sabor:'Descartável 15.000 puffs',sabores:['Blueberry Ice','Grape Ice','Menta Gelada'],destaque:true,desc:15,selo:'promo',img:'',cor:'#5B4BFF'},{id:2,nome:'Aura Pod Kit',cat:'Refilável',preco:189.9,estoque:12,sabor:'Kit com 2 pods',destaque:true,desc:0,selo:'',img:'',cor:'#FF7A59'},{id:3,nome:'Cartucho Mint 2ml',cat:'Pod',preco:39.9,estoque:60,sabor:'Menta gelada',destaque:false,desc:0,selo:'',img:'',cor:'#1FB28A'},{id:4,nome:'Cartucho Mango 2ml',cat:'Pod',preco:39.9,estoque:45,sabor:'Manga tropical',destaque:false,desc:0,selo:'',img:'',cor:'#F2A900'},{id:5,nome:'Vortex Slim 8K',cat:'Descartável',preco:89.9,estoque:0,sabor:'Uva gelada',destaque:false,desc:0,selo:'',img:'',cor:'#9B3DDB'},{id:6,nome:'Carregador USB-C',cat:'Acessório',preco:24.9,estoque:80,sabor:'Cabo 1m',destaque:false,desc:0,selo:'',img:'',cor:'#3B4B6B'}];
const cfg=async()=>Object.assign({nome:'Valora Pods NS',entregadores:['Entregador 1'],aberta:true,taxa:0,gratis:0,minimo:0,cupons:[]},await kv('config',{}));
async function salvarImg(u){u=String(u||'');const m=/^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(u);
 if(!m)return /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(u)?u:'';
 const b=Buffer.from(m[2],'base64');if(!b.length||b.length>3e6)return '';
 if(process.env.BLOB_READ_WRITE_TOKEN){const{put}=require('@vercel/blob');const r=await put('produtos/'+crypto.randomBytes(8).toString('hex')+'.'+(m[1]==='jpeg'?'jpg':m[1]),b,{access:'public',contentType:'image/'+m[1]});return r.url}
 return b.length<300000?u:''}

module.exports=async(req,res)=>{
 const out=(d,c=200)=>{res.setHeader('Cache-Control','no-store');res.status(c).json(d)};
 const r=req.query.r||'',inp=req.body&&typeof req.body==='object'?req.body:{};
 const post=()=>req.method==='POST'&&req.headers['x-requested-with']==='fetch';
 try{
 if(!U||!T)return out({erro:'Banco não configurado. Conecte o Upstash Redis no projeto da Vercel.'},500);
 if(r==='boot'){
  if(await kv('auth')===null)await kvs('auth',hash('pods123'));
  if(await kv('produtos')===null)await kvs('produtos',SEED);
  const a=isAdmin(req);return out({produtos:await kv('produtos',[]),config:await cfg(),pedidos:a?await kv('pedidos',[]):[],admin:a})}
 if(r==='webhook'){ // AbacatePay: /api?r=webhook&secret=SEU_SEGREDO
  if(!process.env.WEBHOOK_SECRET||req.query.secret!==process.env.WEBHOOK_SECRET)return out({erro:'negado'},403);
  const j=JSON.stringify(inp),m=/"externalId":"(\d+)"/.exec(j);if(!/paid/i.test(j)||!m)return out({ok:1});
  await lock();try{const pd=await kv('pedidos',[]);pd.forEach(o=>{if(String(o.id)===m[1])o.pago=true});await kvs('pedidos',pd)}finally{await unlock()}return out({ok:1})}
 if(!post())return out({erro:'Requisição inválida'},400);
 if(r==='login'){const ip=String(req.headers['x-forwarded-for']||'x').split(',')[0].trim(),k='loja:tent:'+ip;
  if(+(await rd(['GET',k])||0)>=5)return out({erro:'Muitas tentativas. Aguarde 10 minutos.'},429);
  if(check(String(inp.senha||''),await kv('auth'))){const exp=Date.now()+12*3600e3;res.setHeader('Set-Cookie',`adm=${exp}.${sig(String(exp))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=43200`);await rd(['DEL',k]);return out({ok:1})}
  await rd(['INCR',k]);await rd(['EXPIRE',k,600]);return out({erro:'Senha incorreta. Tente novamente.'},401)}
 if(r==='logout'){res.setHeader('Set-Cookie','adm=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');return out({ok:1})}
 if(r==='save'){if(!isAdmin(req))return out({erro:'Sessão expirada. Entre novamente.'},401);const k=req.query.k;
  if(k==='config'){const c={...inp};if(c.senha){if(String(c.senha).length<6)return out({erro:'A senha precisa ter 6 ou mais caracteres.'},422);await kvs('auth',hash(String(c.senha)))}delete c.senha;await kvs('config',c);return out({ok:1,v:c})}
  if(k==='produtos'){const l=[];for(const p of Array.isArray(inp)?inp:[]){l.push({...p,id:+p.id,nome:s(p.nome),preco:+(+p.preco).toFixed(2),estoque:Math.max(0,+p.estoque|0),desc:Math.min(90,Math.max(0,+p.desc|0)),img:await salvarImg(p.img)})}
   await lock();try{await kvs('produtos',l)}finally{await unlock()}return out({ok:1,v:l})}
  if(k==='pedidos'){const arr=Array.isArray(inp)?inp:[];await lock();try{
   if(!arr.length){await kvs('pedidos',[]);return out({ok:1,v:[]})}
   const at=await kv('pedidos',[]),mp=new Map(arr.map(o=>[o.id,o]));
   at.forEach(o=>{const n=mp.get(o.id);if(n){['status','pago','entregador','entregueEm'].forEach(f=>{if(n[f]!==undefined)o[f]=n[f]});mp.delete(o.id)}});
   mp.forEach(o=>at.push(o));at.sort((a,b)=>b.id-a.id);await kvs('pedidos',at);return out({ok:1,v:at})}finally{await unlock()}}
  return out({erro:'Chave inválida'},400)}
 if(r==='pedido'){const c=await cfg();if(!c.aberta)return out({erro:'A loja está fechada no momento.'},403);
  const nome=s(inp.cliente,80),tel=s(inp.tel,30),rua=s(inp.rua),num=s(inp.numero,20),bai=s(inp.bairro,80);
  if(!nome||!tel||!rua||!num||!bai||!Array.isArray(inp.itens)||!inp.itens.length)return out({erro:'Preencha todos os campos obrigatórios.'},422);
  await lock();try{ // preço, cupom, frete e estoque calculados AQUI
   const ps=await kv('produtos',[]),itens=[];let sub=0;
   for(const i of inp.itens){const q=+i.q|0;if(q<1)continue;const p=ps.find(x=>x.id===+i.id);if(!p)return out({erro:'Produto indisponível.'},422);
    if(p.estoque<q)return out({erro:'Sem estoque suficiente: '+p.nome},422);
    let sab=s(i.sab,60);if(sab&&!(p.sabores||[]).includes(sab))sab='';
    p.estoque-=q;const pf=preco(p);sub+=pf*q;itens.push({pid:p.id,nome:p.nome,sabor:sab,q,preco:pf})}
   if(!itens.length)return out({erro:'Carrinho vazio.'},422);
   if(c.minimo>0&&sub<c.minimo)return out({erro:'Pedido mínimo: R$ '+Number(c.minimo).toFixed(2).replace('.',',')},422);
   const cod=s(inp.cupom,20).toUpperCase(),k=(c.cupons||[]).find(x=>x.codigo===cod),pct=k?+k.pct:0;
   const desc=+(sub*pct/100).toFixed(2),base=sub-desc,taxa=(c.gratis>0&&base>=c.gratis)?0:+c.taxa||0;
   const pd=await kv('pedidos',[]),n=pd.length?Math.max(...pd.map(x=>x.num||0))+1:1;
   const o={id:Date.now(),num:n,cliente:nome,tel,end:{rua,numero:num,bairro:bai,comp:s(inp.comp,60)},itens,subtotal:sub,desconto:desc,cupom:pct?cod:'',taxa,total:+(base+taxa).toFixed(2),pag:inp.pag==='agora'?'agora':'entrega',pago:false,status:'Novo',entregador:'',data:new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})};
   pd.unshift(o);await kvs('produtos',ps);await kvs('pedidos',pd);return out({ok:1,pedido:o})}finally{await unlock()}}
 if(r==='cobranca'){const key=process.env.ABACATEPAY_KEY;if(!key)return out({erro:'Pagamento online não configurado'},503);
  const o=(await kv('pedidos',[])).find(x=>x.id===+inp.pedidoId);if(!o||o.pago)return out({erro:'Pedido inválido'},404);
  const site=process.env.SITE_URL||('https://'+req.headers.host+'/');
  const g=await fetch('https://api.abacatepay.com/v1/billing/create',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify({frequency:'ONE_TIME',methods:['PIX'],products:[{externalId:String(o.id),name:'Pedido #'+o.num,quantity:1,price:Math.round(o.total*100)}],returnUrl:site,completionUrl:site})});
  const j=await g.json().catch(()=>({}));if(!j.data||!j.data.url)return out({erro:'Gateway indisponível'},502);return out({url:j.data.url})}
 return out({erro:'Rota não encontrada'},404);
 }catch(e){return out({erro:e.message||'Erro no servidor'},500)}
};
