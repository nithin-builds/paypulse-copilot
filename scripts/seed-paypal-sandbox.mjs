import{PayPalSandbox}from"../src/paypal-sandbox.mjs";
const env=process.env,tx=process.argv.find(x=>x.startsWith("--buyer-transaction-id="))?.split("=")[1];
if(!env.PAYPAL_CLIENT_ID||!env.PAYPAL_CLIENT_SECRET||!env.PAYPAL_BUYER_PAYER_ID||!tx){console.error("Usage: PAYPAL_CLIENT_ID=… PAYPAL_CLIENT_SECRET=… PAYPAL_BUYER_PAYER_ID=… npm run seed:sandbox -- --buyer-transaction-id=…");process.exit(1)}
const audit=[],p=new PayPalSandbox({clientId:env.PAYPAL_CLIENT_ID,clientSecret:env.PAYPAL_CLIENT_SECRET,onAudit:e=>audit.push(e)});
const assertion=Buffer.from(JSON.stringify({alg:"none"})).toString("base64url")+"."+Buffer.from(JSON.stringify({iss:env.PAYPAL_CLIENT_ID,payer_id:env.PAYPAL_BUYER_PAYER_ID})).toString("base64url")+".";
const input={disputed_transactions:[{buyer_transaction_id:tx}],reason:"MERCHANDISE_OR_SERVICE_NOT_RECEIVED",dispute_amount:{currency_code:env.SEED_CURRENCY||"USD",value:env.SEED_AMOUNT||"20"},extensions:{merchant_contacted:true,merchant_contacted_outcome:"NO_RESPONSE",merchandize_dispute_properties:{issue_type:"PRODUCT"}}};
const form=new FormData();form.append("input",new Blob([JSON.stringify(input)],{type:"application/json"}));
let created=await p.req("/v1/customer/disputes",{method:"POST",headers:{"PayPal-Auth-Assertion":assertion},body:form});
let dispute=created.body,id=dispute.dispute_id||dispute.id||dispute.links?.find(x=>x.rel==="self")?.href.split("/").pop();
const act=async rel=>{dispute=(await p.getDispute(id)).body;const link=dispute.links?.find(x=>x.rel===rel);if(!link)throw Error("HATEOAS_ACTION_NOT_AVAILABLE:"+rel);return link};
if(dispute.status!=="UNDER_REVIEW"){const l=await act("escalate");await p.req(new URL(l.href).pathname,{method:"POST",body:JSON.stringify({note:"Sandbox seed escalation"})})}
const req=await act("require-evidence");await p.req(new URL(req.href).pathname,{method:"POST",body:JSON.stringify({action:"SELLER_EVIDENCE"})});
dispute=(await p.getDispute(id)).body;
console.log(JSON.stringify({disputeId:id,status:dispute.status,ready:dispute.status==="WAITING_FOR_SELLER_RESPONSE",audit},null,2));
