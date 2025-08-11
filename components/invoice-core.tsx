
"use client";
import React from "react";

export const uid = () => Math.random().toString(36).slice(2);
export const currency = (n:any)=> new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(Number(n||0));

export const TEMPLATES = [
  {id:"minimal",name:"Minimal",style:"bg-slate-900",colors:["#0f172a","#1f2937","#334155"],vibe:"Sobrio"},
  {id:"classic",name:"Clásica",style:"bg-indigo-600",colors:["#4338ca","#3730a3","#312e81"],vibe:"Formal"},
  {id:"modern",name:"Moderna",style:"bg-emerald-600",colors:["#059669","#047857","#065f46"],vibe:"Actual"},
  {id:"elegant",name:"Elegante",style:"bg-rose-600",colors:["#e11d48","#be123c","#9f1239"],vibe:"Premium"},
  {id:"tech",name:"Tech",style:"bg-cyan-600",colors:["#0891b2","#0e7490","#155e75"],vibe:"Start-up"},
  {id:"bold",name:"Bold",style:"bg-amber-500",colors:["#f59e0b","#d97706","#b45309"],vibe:"Destacado"},
  {id:"mono",name:"Monocromo",style:"bg-neutral-800",colors:["#0a0a0a","#262626","#525252"],vibe:"Minimal extremo"},
  {id:"art",name:"Artístico",style:"bg-fuchsia-600",colors:["#c026d3","#a21caf","#86198f"],vibe:"Creativo"},
  {id:"paper",name:"Papel",style:"bg-lime-600",colors:["#65a30d","#4d7c0f","#3f6212"],vibe:"Clásico moderno"},
  {id:"blueprint",name:"Blueprint",style:"bg-blue-700",colors:["#1d4ed8","#1e40af","#1e3a8a"],vibe:"Ingeniería"},
];

export const DEFAULT_SAMPLE:any={
  number:"0001",
  date:new Date().toISOString().slice(0,10),
  dueDate:new Date(Date.now()+7*864e5).toISOString().slice(0,10),
  purchaseOrder:"PO-2025-001",
  paymentMethod:"Transferencia",
  bankIban:"ES12 3456 7890 1234 5678 9012",
  issuer:{name:"Tu Empresa S.L.",nif:"B12345678",address:"Calle Mayor 1, Madrid",email:"facturas@empresa.com",phone:"+34 600 000 000"},
  client:{name:"Cliente Demo",nif:"00000000A",address:"C/ Falsa 123, Barcelona",email:"cliente@demo.com"},
  items:[{id:uid(),description:"Servicio profesional",qty:1,price:300},{id:uid(),description:"Soporte",qty:2,price:50}],
  notes:"Gracias por su confianza.",terms:"Pago a 7 días. Recargo por demora 1%.",
  logo:"/logo.svg", color:TEMPLATES[0].colors[0], discount:{mode:"percent",value:0}, taxRate:21, templateId:"minimal",
};

export const calcTotals=(items:any[],discount:any={mode:"percent",value:0},taxRate=21)=>{
  const subtotal=items.reduce((s,it)=>s+Number(it.qty||0)*Number(it.price||0),0);
  const discountValue=discount.mode==="percent"?(subtotal*(discount.value||0))/100:(discount.value||0);
  const base=Math.max(0, subtotal-discountValue);
  const taxes=(base*Number(taxRate||0))/100;
  return {subtotal,discount:discountValue,base,taxes,total:base+taxes};
};

export const Divider = () => <div className="h-px w-full bg-slate-200" />;

function HeaderBlock({invoice,accent,variant="chip",mono=false}:any){
  return (<div className={`flex items-start justify-between gap-6 ${variant==="band"?"rounded-lg p-3 text-white":""}`} style={variant==="band"?{background:accent.color}:{}}>
    <div>{variant!=="big"&&variant!=="band"&&(<div className={`inline-block rounded-full px-2 py-0.5 text-xs ${mono?"text-white bg-black":"text-white"}`} style={variant==="chip"?{background:accent.color}:{}}>Factura</div>)}
      <h2 className={`mt-2 font-bold ${variant==="big"?"text-3xl":"text-xl"}`}>#{invoice.number}</h2>
      <p className={`text-sm ${mono?"text-neutral-600":"text-slate-600"}`}>Fecha: {invoice.date} · Vencimiento: {invoice.dueDate}</p></div>
    <div className="text-right">{invoice.logo && <img src={invoice.logo} alt="logo" className="ml-auto mb-2 h-10 object-contain"/>}<h3 className={`text-sm font-semibold ${mono?"text-neutral-900":"text-slate-900"}`}>{invoice.issuer?.name}</h3><p className={`text-xs ${mono?"text-neutral-600":"text-slate-600"}`}>{invoice.issuer?.nif}</p></div>
  </div>);
}
function TwoCols({invoice,subtle=false,inverted=false,mono=false}:any){
  return (<div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
    <div className={`${subtle?"rounded-lg bg-slate-50 p-3":""} ${mono?"text-neutral-700":""}`}><p className={`font-semibold ${mono?"text-neutral-900":"text-slate-900"}`}>Facturar a</p><p className="text-slate-700">{invoice.client?.name}</p><p className="text-slate-500">{invoice.client?.nif}</p></div>
    <div className={`${inverted?"rounded-lg text-white p-3":""}`} style={inverted?{background:"#0ea5b7"}:{}}><p className={`font-semibold ${inverted?"text-white":"text-slate-900"}`}>Pago</p><p className={`${inverted?"text-white/90":"text-slate-700"}`}>{invoice.paymentMethod}</p><p className={`${inverted?"text-white/80":"text-slate-500"}`}>{invoice.bankIban}</p></div>
  </div>);
}
function ItemsTable({items,totals,taxRate,accent,variant="simple",compact=false}:any){
  const th=variant==="mono"?'text-neutral-700':'text-slate-600'; const tableCls=variant==="bordered"?'border border-slate-200':variant==="thick"?'border-t-2 border-b-2 border-slate-900':'';
  return (<div className={`mt-4 overflow-x-auto ${compact?"text-[12px]":""}`}>
    <table className={`min-w-full ${tableCls}`}><thead><tr className={th}><th className="w-2/3">Descripción</th><th>Cant.</th><th>Precio</th><th>Importe</th></tr></thead>
      <tbody>{items.map((it:any,i:number)=>(<tr key={i} className={variant==="striped"&&i%2?'bg-slate-50':''}><td>{it.description}</td><td>{it.qty}</td><td>{currency(it.price)}</td><td>{currency(Number(it.qty)*Number(it.price))}</td></tr>))}</tbody>
    </table>
    <div className="mt-4 ml-auto w-full max-w-xs text-sm">
      <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{currency(totals.subtotal)}</span></div>
      <div className="flex justify-between"><span className="text-slate-600">Descuento</span><span className="font-medium">-{currency(totals.discount)}</span></div>
      <div className="flex justify-between"><span className="text-slate-600">Base</span><span className="font-medium">{currency(totals.base)}</span></div>
      <div className="flex justify-between"><span className="text-slate-600">IVA ({taxRate}%)</span><span className="font-medium">{currency(totals.taxes)}</span></div>
      <Divider/><div className="flex justify-between text-base font-semibold"><span>Total</span><span style={{color:accent.color}}>{currency(totals.total)}</span></div>
    </div>
  </div>);
}
function NotesTerms({invoice}:any){ return (invoice.notes||invoice.terms)?(<div className="mt-4 grid gap-4 text-xs md:grid-cols-2">
  {invoice.notes && <div><p className="font-semibold text-slate-900">Notas</p><p className="text-slate-700 whitespace-pre-wrap">{invoice.notes}</p></div>}
  {invoice.terms && <div><p className="font-semibold text-slate-900">Términos</p><p className="text-slate-700 whitespace-pre-wrap">{invoice.terms}</p></div>}
</div>):null; }

export function InvoiceDocByTemplate({invoice, templateId, accentColor, compact=false}:any){
  const items=invoice.items||[]; const totals=calcTotals(items, invoice.discount, invoice.taxRate); const accent={color: accentColor || invoice.color || "#0f172a"}; const scale=compact?"scale-75 origin-top":"scale-100";
  return (<div className={`rounded-2xl border border-slate-200 bg-white p-4 ${compact?"h-48 overflow-hidden":"p-6"}`}>
    {templateId==="classic" && (<><HeaderBlock invoice={invoice} accent={accent} variant="band"/><TwoCols invoice={invoice}/><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="bordered"/>{!compact && <NotesTerms invoice={invoice}/>}</>)}
    {templateId==="modern" && (<div className={scale}><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">Factura #{invoice.number}</h2><p className="text-sm text-slate-600">{invoice.date} · Vence {invoice.dueDate}</p></div><div className="rounded-xl px-3 py-1 text-xs text-white" style={{background:accent.color}}>Total {currency(totals.total)}</div></div><div className="mt-3 grid gap-2 md:grid-cols-2"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold">Facturar a</p><p className="text-sm">{invoice.client?.name}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold">Pago</p><p className="text-sm">{invoice.paymentMethod}</p></div></div><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="striped" compact={compact}/>{!compact && <NotesTerms invoice={invoice}/>}</div>)}
    {templateId==="elegant" && (<div className={scale}><div className="flex items-start justify-between border-b border-slate-200 pb-3"><div><p className="text-sm font-semibold" style={{color:accent.color}}>FACTURA</p><h2 className="text-xl font-bold">{invoice.issuer?.name}</h2></div>{invoice.logo && <img src={invoice.logo} className="h-10 object-contain"/>}</div><TwoCols invoice={invoice} subtle/><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="clean" compact={compact}/>{!compact && <NotesTerms invoice={invoice}/>}</div>)}
    {templateId==="tech" && (<div className={scale}><div className="rounded-lg p-3 text-white" style={{background:accent.color}}><div className="flex items-center justify-between"><b>Factura #{invoice.number}</b><span>{invoice.date}</span></div></div><TwoCols invoice={invoice} inverted/><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="bordered" compact={compact}/>{!compact && <NotesTerms invoice={invoice}/>}</div>)}
    {templateId==="bold" && (<div className={scale}><HeaderBlock invoice={invoice} accent={accent} variant="big"/><TwoCols invoice={invoice}/><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="thick" compact={compact}/>{!compact && <NotesTerms invoice={invoice}/>}</div>)}
    {templateId==="mono" && (<div className={scale}><HeaderBlock invoice={invoice} accent={{color:"#111"}} mono/><TwoCols invoice={invoice} mono/><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={{color:"#111"}} variant="mono" compact={compact}/>{!compact && <NotesTerms invoice={invoice}/>}</div>)}
    {templateId==="art" && (<div className={scale}><div className="flex gap-4"><div className="hidden w-2 rounded-lg sm:block" style={{background:accent.color}}/><div className="flex-1"><HeaderBlock invoice={invoice} accent={accent} variant="chip"/><TwoCols invoice={invoice}/><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="striped" compact={compact}/></div></div>{!compact && <NotesTerms invoice={invoice}/>}</div>)}
    {templateId==="paper" && (<div className={scale}><div className="rounded-lg border border-slate-300 p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.02)]"><HeaderBlock invoice={invoice} accent={accent} variant="chip"/><TwoCols invoice={invoice}/><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="bordered" compact={compact}/>{!compact && <NotesTerms invoice={invoice}/>}</div></div>)}
    {templateId==="blueprint" && (<div className={scale}><div className="rounded-lg border border-blue-200 bg-blue-50 p-3"><HeaderBlock invoice={invoice} accent={{color:"#1d4ed8"}} variant="band"/><TwoCols invoice={invoice} subtle/><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={{color:"#1d4ed8"}} variant="bordered" compact={compact}/>{!compact && <NotesTerms invoice={invoice}/>}</div></div>)}
    {templateId==="minimal" && (<div className={scale}><HeaderBlock invoice={invoice} accent={accent} variant="chip"/><TwoCols invoice={invoice}/><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="simple" compact={compact}/>{!compact && <NotesTerms invoice={invoice}/>}</div>)}
  </div>);
}
