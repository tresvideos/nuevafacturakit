
"use client";
import React, {useEffect, useMemo, useRef, useState} from "react";
import MiniInvoicePreview from "@/components/MiniInvoicePreview";
import { InvoiceDocByTemplate, DEFAULT_SAMPLE, TEMPLATES, uid, currency, calcTotals, Divider } from "@/components/invoice-core";

/* UI primitives */
const Container = ({className="", children}: any) => <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
const Card = ({className="", children}: any) => <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({title, subtitle, right, className=""}: any) => (
  <div className={`flex items-start justify-between gap-4 p-5 ${className}`}>
    <div><h3 className="text-lg font-semibold text-slate-900">{title}</h3>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>{right}
  </div>
);
const CardBody = ({className="", children}: any) => <div className={`p-5 ${className}`}>{children}</div>;
const Button = ({children, className="", variant="primary", ...p}: any) => {
  const base="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  const v:any={primary:"bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900/20",secondary:"bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300",ghost:"bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300",danger:"bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-600/20",outline:"border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 focus:ring-slate-300",success:"bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-600/20"};
  return <button className={`${base} ${v[variant]} ${className}`} {...p}>{children}</button>;
};
const Input = ({className="", ...p}: any) => <input className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`} {...p}/>;
const Select=({className="", children, ...p}: any)=><select className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`} {...p}>{children}</select>;
const Textarea=({className="", ...p}: any)=><textarea className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`} {...p}/>;
const Badge = ({children, className=""}: any)=><span className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ${className}`}>{children}</span>;
const Modal=({open,onClose,title,children,wide=false}:any)=>!open?null:(
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-slate-900/50" onClick={onClose}/>
    <div className={`relative z-10 max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl ${wide?"w-[1080px]":"w-[720px]"}`}>
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-600"><path fill="currentColor" d="M6.4 4.98 4.98 6.4 10.59 12l-5.6 5.6L6.4 19.98 12 14.41l5.6 5.57 1.41-1.41L13.41 12l5.6-5.6L17.6 4.98 12 10.59z"/></svg>
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

/* store + auth */
const LS_KEY="invoice_saas_v7";
const getStore=():any=>{try{return JSON.parse(localStorage.getItem(LS_KEY)||"{}")}catch{return{}}};
const setStore=(o:any)=>localStorage.setItem(LS_KEY, JSON.stringify(o));
function useAuth(){
  const [user,setUser]=useState<any>(null);
  useEffect(()=>{const s=getStore(); if(s.currentUser) setUser(s.currentUser);},[]);
  const signup=(email:string,pwd:string)=>{const s=getStore(); s.users=s.users||{}; if(s.users[email]) throw new Error("Este correo ya está registrado."); s.users[email]={email,password:pwd,invoices:[],plan:{name:"free",remaining:3,max:3}}; s.currentUser={email}; setStore(s); setUser({email});};
  const login=(email:string,pwd:string)=>{const s=getStore(); if(!s.users||!s.users[email]) throw new Error("Usuario no encontrado."); if(s.users[email].password!==pwd) throw new Error("Contraseña incorrecta."); s.currentUser={email}; setStore(s); setUser({email});};
  const logout=()=>{const s=getStore(); delete s.currentUser; setStore(s); setUser(null);};
  const getUserData=()=>{const s=getStore(); return s.users?.[user?.email]||null;};
  const setUserData=(u:any)=>{const s=getStore(); if(!user) return; const d=s.users?.[user.email]; s.users[user.email]=typeof u==="function"?u(d):u; setStore(s);};
  return {user,signup,login,logout,getUserData,setUserData};
}

/* Header */
function Header({onGoto,user,onOpenContact}:any){
  return (<header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
    <Container><div className="flex h-16 items-center justify-between">
      <div className="flex items-center gap-3"><img src="/logo.svg" className="h-9 w-9 rounded-lg" alt="logo"/><span className="hidden text-sm font-semibold text-slate-900 sm:block">Facturakit</span></div>
      <nav className="flex items-center gap-2">
        <Button variant="ghost" onClick={()=>onGoto("home")} className="hidden sm:inline-flex">Inicio</Button>
        <Button variant="ghost" onClick={()=>onGoto("templates")} className="hidden sm:inline-flex">Plantillas</Button>
        <Button variant="ghost" onClick={onOpenContact} className="hidden sm:inline-flex">Contacto</Button>
        {user? <Button onClick={()=>onGoto("dashboard")}>Panel</Button> : <><Button variant="secondary" onClick={()=>onGoto("login")}>Entrar</Button><Button onClick={()=>onGoto("signup")}>Crear cuenta</Button></>}
      </nav>
    </div></Container>
  </header>);
}

/* ---------- Home (completa) ---------- */
function Home({ onGoto }: any) {
  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <Container className="py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Facturakit" className="h-8 w-8 rounded-md"/>
                <Badge>V7.4.1</Badge>
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Facturas bonitas y profesionales en 2 minutos
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                10 plantillas con diseño real, editor completo y exportación a <b>PDF</b> o <b>HTML</b>. Las <b>3 primeras</b> son gratis.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => onGoto("templates")} variant="success">Crear factura ahora</Button>
                <Button variant="secondary" onClick={() => onGoto("templates")}>Ver plantillas</Button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex -space-x-2">
                  {["Ana", "Carlos", "María", "Jorge"].map((n) => (
                    <div key={n} className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 grid place-items-center text-xs font-semibold text-slate-700">
                      {n.slice(0,1)}
                    </div>
                  ))}
                </div>
                <span>+1.200 usuarios activos</span>
              </div>
            </div>
            <div className="relative">
              <img src="/hero-invoice.svg" alt="Ejemplo de factura" className="w-full rounded-2xl border border-slate-200 shadow-sm"/>
              <div className="absolute -bottom-4 -left-4 hidden sm:block rounded-xl bg-white p-2 shadow-md">
                <MiniInvoicePreview templateId="elegant" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* BENEFICIOS */}
      <section className="bg-white">
        <Container className="py-16">
          <h2 className="text-center text-2xl font-bold">Todo lo que necesitas</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Plantillas con diseño real", d: "Cada estilo modifica la estructura, no solo el color." },
              { t: "Previsualización en vivo", d: "Ve la factura mientras rellenas los datos." },
              { t: "Logo y paletas", d: "Sube tu logo y elige colores por plantilla." },
              { t: "Descarga inmediata", d: "Exporta PDF (print) o HTML en 1 clic." },
            ].map((f) => (
              <Card key={f.t}><CardBody><h3 className="text-base font-semibold text-slate-900">{f.t}</h3><p className="mt-1 text-sm text-slate-600">{f.d}</p></CardBody></Card>
            ))}
          </div>
        </Container>
      </section>

      {/* PLANTILLAS */}
      <section className="bg-slate-50">
        <Container className="py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold">Plantillas populares</h2>
            <Button variant="ghost" onClick={() => onGoto("templates")}>Ver todas</Button>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {["minimal","classic","modern","elegant"].map(id => (
              <Card key={id}>
                <CardBody>
                  <MiniInvoicePreview templateId={id}/>
                  <p className="mt-3 text-sm font-semibold capitalize">{id}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* PASOS */}
      <section>
        <Container className="py-16">
          <h2 className="text-center text-2xl font-bold">Cómo funciona</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {["Elige plantilla", "Rellena datos", "Descarga"].map((s, i) => (
              <Card key={s}><CardBody>
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white">{i + 1}</div>
                  <h3 className="text-base font-semibold text-slate-900">{s}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {i === 0 ? "10 estilos con mini‑previews reales."
                   : i === 1 ? "Logo, colores, conceptos, impuestos y descuentos."
                   : "PDF o HTML listos para enviar."}
                </p>
              </CardBody></Card>
            ))}
          </div>
        </Container>
      </section>

      {/* TESTIMONIOS */}
      <section className="bg-white">
        <Container className="py-16">
          <h2 className="text-center text-2xl font-bold">Opiniones</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[{ n: "Ana López", t: "Diseñadora", m: "Se ve profesional y es súper rápido." },
              { n: "Diego Martín", t: "Autónomo", m: "Me ahorra tiempo cada mes." },
              { n: "Laura Pérez", t: "Consultora", m: "Las plantillas tienen mucho nivel." }].map((r) => (
              <Card key={r.n}><CardBody>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 grid place-items-center font-semibold text-slate-700">
                    {r.n.split(" ").map(p => p[0]).join("")}
                  </div>
                  <div><p className="text-sm font-semibold text-slate-900">{r.n}</p><p className="text-xs text-slate-500">{r.t}</p></div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-amber-500">{Array.from({length:5}).map((_,i)=>(<span key={i}>★</span>))}</div>
                <p className="mt-2 text-sm text-slate-700">“{r.m}”</p>
              </CardBody></Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="bg-slate-900">
        <Container className="py-14 text-center">
          <h3 className="text-2xl font-bold text-white">Crea tu primera factura gratis</h3>
          <p className="mt-2 text-slate-300">Sin tarjetas ni complicaciones: 3 descargas gratuitas.</p>
          <Button className="mt-4" onClick={() => onGoto("templates")}>Empezar</Button>
        </Container>
      </section>
    </>
  );
}

/* Templates list */
function Templates({onPick,onPreviewTemplate}:any){
  return (<Container className="py-12"><h2 className="text-2xl font-bold text-slate-900">Elige una plantilla</h2><p className="mt-2 text-slate-600">Clásicas, modernas y artísticas. Previsualiza antes de usar.</p>
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {TEMPLATES.map(t=>(<Card key={t.id}><CardHeader title={`${t.name}`} subtitle={t.vibe} right={<Badge>Demo</Badge>}/><CardBody>
        <MiniInvoicePreview templateId={t.id}/>
        <div className="mt-3 flex items-center justify-between gap-2"><Button variant="secondary" onClick={()=>onPreviewTemplate(t)}>Ver ejemplo</Button><Button onClick={()=>onPick(t)}>Usar</Button></div>
      </CardBody></Card>))}
    </div>
  </Container>);
}

/* Builder */
function Builder({template, initial, onBack, onProceed, auth}:any){
  const [inv,setInv]=useState<any>(()=>({... (initial||DEFAULT_SAMPLE), templateId: template?.id || DEFAULT_SAMPLE.templateId, color: template?.colors?.[0] || DEFAULT_SAMPLE.color}));
  const change=(p:any)=>setInv((x:any)=>({...x,...p}));
  const updateIssuer=(k:string,v:any)=>change({issuer:{...inv.issuer,[k]:v}});
  const updateClient=(k:string,v:any)=>change({client:{...inv.client,[k]:v}});
  const updateItem=(id:string,p:any)=>change({items:inv.items.map((it:any)=>it.id===id?{...it,...p}:it)});
  const addItem=()=>change({items:[...inv.items,{id:uid(),description:"Nuevo concepto",qty:1,price:0}]});
  const removeItem=(id:string)=>change({items:inv.items.filter((it:any)=>it.id!==id)});
  const onLogo=(e:any)=>{const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>change({logo:r.result}); r.readAsDataURL(f);};
  const totals=useMemo(()=>calcTotals(inv.items, inv.discount, inv.taxRate),[inv.items, inv.discount, inv.taxRate]);
  const proceed=()=>onProceed(inv);
  return (<Container className="py-8">
    <div className="mb-6 flex items-center gap-3"><Button variant="secondary" onClick={onBack}>Volver</Button><Badge>Plantilla: {template?.name}</Badge>
      <Select className="w-auto" value={inv.templateId} onChange={(e:any)=>change({templateId:e.target.value})}>{TEMPLATES.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</Select>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader title="Datos de la factura" subtitle="Completa todos los campos necesarios"/><CardBody className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-slate-600">Nº factura</label><Input value={inv.number} onChange={(e:any)=>change({number:e.target.value})}/></div>
          <div><label className="text-xs font-medium text-slate-600">Fecha</label><Input type="date" value={inv.date} onChange={(e:any)=>change({date:e.target.value})}/></div>
          <div><label className="text-xs font-medium text-slate-600">Vencimiento</label><Input type="date" value={inv.dueDate} onChange={(e:any)=>change({dueDate:e.target.value})}/></div>
          <div><label className="text-xs font-medium text-slate-600">Pedido/PO</label><Input value={inv.purchaseOrder} onChange={(e:any)=>change({purchaseOrder:e.target.value})}/></div>
        </div>
        <Card className="border-slate-200"><CardHeader title="Emisor"/><CardBody className="grid grid-cols-2 gap-3">
          <Input placeholder="Nombre" value={inv.issuer.name} onChange={(e:any)=>updateIssuer("name",e.target.value)}/>
          <Input placeholder="NIF/CIF" value={inv.issuer.nif} onChange={(e:any)=>updateIssuer("nif",e.target.value)}/>
          <Input placeholder="Dirección" value={inv.issuer.address} onChange={(e:any)=>updateIssuer("address",e.target.value)}/>
          <Input placeholder="Email" value={inv.issuer.email} onChange={(e:any)=>updateIssuer("email",e.target.value)}/>
          <Input placeholder="Teléfono" value={inv.issuer.phone} onChange={(e:any)=>updateIssuer("phone",e.target.value)}/>
          <div><label className="text-xs font-medium text-slate-600">Logo</label><Input type="file" accept="image/*" onChange={onLogo}/></div>
        </CardBody></Card>
        <Card><CardHeader title="Cliente"/><CardBody className="grid grid-cols-2 gap-3">
          <Input placeholder="Nombre" value={inv.client.name} onChange={(e:any)=>updateClient("name",e.target.value)}/>
          <Input placeholder="NIF" value={inv.client.nif} onChange={(e:any)=>updateClient("nif",e.target.value)}/>
          <Input placeholder="Dirección" value={inv.client.address} onChange={(e:any)=>updateClient("address",e.target.value)}/>
          <Input placeholder="Email" value={inv.client.email} onChange={(e:any)=>updateClient("email",e.target.value)}/>
        </CardBody></Card>
        <Card><CardHeader title="Conceptos" right={<Button variant="secondary" onClick={addItem}>Añadir</Button>}/><CardBody className="space-y-3">
          {inv.items.map((it:any)=>(<div key={it.id} className="grid grid-cols-12 items-center gap-2">
            <Input className="col-span-6" value={it.description} onChange={(e:any)=>updateItem(it.id,{description:e.target.value})}/>
            <Input className="col-span-2" type="number" min="0" step="1" value={it.qty} onChange={(e:any)=>updateItem(it.id,{qty:Number(e.target.value)})}/>
            <Input className="col-span-3" type="number" min="0" step="0.01" value={it.price} onChange={(e:any)=>updateItem(it.id,{price:Number(e.target.value)})}/>
            <button className="col-span-1 rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={()=>removeItem(it.id)} aria-label="Eliminar">×</button>
          </div>))}
        </CardBody></Card>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-slate-600">Impuestos (%)</label><Input type="number" min="0" step="0.1" value={inv.taxRate} onChange={(e:any)=>change({taxRate:Number(e.target.value)})}/></div>
          <div className="grid grid-cols-2 gap-2"><Select value={inv.discount.mode} onChange={(e:any)=>change({discount:{...inv.discount,mode:e.target.value}})}><option value="percent">Descuento %</option><option value="amount">Descuento €</option></Select><Input type="number" min="0" step="0.01" value={inv.discount.value} onChange={(e:any)=>change({discount:{...inv.discount,value:Number(e.target.value)}})}/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-slate-600">Método de pago</label><Input value={inv.paymentMethod} onChange={(e:any)=>change({paymentMethod:e.target.value})}/></div>
          <div><label className="text-xs font-medium text-slate-600">IBAN / Banco</label><Input value={inv.bankIban} onChange={(e:any)=>change({bankIban:e.target.value})}/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-slate-600">Color de acento</label><div className="flex flex-wrap gap-2">{(TEMPLATES.find(x=>x.id===inv.templateId)?.colors||[]).map((c:string)=>(<button key={c} className={`h-8 w-8 rounded-full ring-2 ${inv.color===c?"ring-slate-900":"ring-transparent"}`} style={{background:c}} onClick={()=>change({color:c})} type="button"/>))}</div></div>
          <div/>
        </div>
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-medium text-slate-600">Notas</label><Textarea rows={3} value={inv.notes} onChange={(e:any)=>change({notes:e.target.value})}/></div><div><label className="text-xs font-medium text-slate-600">Términos</label><Textarea rows={3} value={inv.terms} onChange={(e:any)=>change({terms:e.target.value})}/></div></div>
        <div className="flex justify-end gap-3"><Button variant="secondary" onClick={onBack}>Atrás</Button><Button onClick={proceed}>Descargar factura</Button></div>
      </CardBody></Card>
      <div className="space-y-3">
        <Card><CardHeader title="Previsualización" subtitle="Actualiza en tiempo real"/><CardBody><InvoiceDocByTemplate invoice={inv} accentColor={inv.color} templateId={inv.templateId}/></CardBody></Card>
        <Card><CardHeader title="Totales"/><CardBody><TotalsView totals={totals}/></CardBody></Card>
      </div>
    </div>
  </Container>);
}
const TotalsView=({totals}:any)=>(<div className="space-y-1 text-sm">
  <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{currency(totals.subtotal)}</span></div>
  <div className="flex justify-between"><span className="text-slate-600">Descuento</span><span className="font-medium">-{currency(totals.discount)}</span></div>
  <div className="flex justify-between"><span className="text-slate-600">Base imponible</span><span className="font-medium">{currency(totals.base)}</span></div>
  <div className="flex justify-between"><span className="text-slate-600">IVA</span><span className="font-medium">{currency(totals.taxes)}</span></div>
  <Divider/><div className="flex justify-between text-base font-semibold"><span>Total</span><span>{currency(totals.total)}</span></div>
</div>);

/* Auth gate */
function AuthGateModal({open,onClose,onAuthed,auth,nextInvoice}:any){
  const [mode,setMode]=useState<"login"|"signup">("login"); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  const submit=(e:any)=>{e.preventDefault(); setError(""); try{ mode==="login"?auth.login(email,password):auth.signup(email,password); onAuthed(nextInvoice);}catch(err:any){setError(err.message||"Error");}};
  return (<Modal open={open} onClose={onClose} title="Crea tu cuenta o entra">
    <p className="mb-3 text-sm text-slate-600">Regístrate o inicia sesión para descargar tu factura.</p>
    <form onSubmit={submit} className="space-y-3"><div className="grid grid-cols-2 gap-3">
      <div><label className="text-xs font-medium text-slate-600">Correo</label><Input type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} required/></div>
      <div><label className="text-xs font-medium text-slate-600">Contraseña</label><Input type="password" value={password} onChange={(e:any)=>setPassword(e.target.value)} required/></div>
    </div>{error && <p className="text-sm text-rose-600">{error}</p>}<Button className="w-full" type="submit">{mode==="login"?"Entrar":"Crear cuenta"}</Button></form>
    <div className="mt-4 flex items-center justify-between gap-2"><button className="text-sm text-slate-700 underline" onClick={()=>setMode(mode==="login"?"signup":"login")}>{mode==="login"?"Crear cuenta":"Ya tengo cuenta"}</button><Button variant="outline">Continuar con Google</Button></div>
  </Modal>);
}

/* Dashboard */
function Dashboard({auth,onOpenContact,onGotoBuilder,onRename}:any){
  const data=auth.getUserData(); const invoices=data?.invoices||[]; const plan=data?.plan||{name:"free",remaining:3,max:3};
  const [tab,setTab]=useState<"invoices"|"help"|"account">("invoices"); const [previewing,setPreviewing]=useState<any>(null);
  const removeInvoice=(id:string)=>{ if(!confirm("¿Eliminar esta factura?")) return; const next=invoices.filter((i:any)=>i.id!==id); auth.setUserData((d:any)=>({...d,invoices:next})); };
  return (<Container className="py-10">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold text-slate-900">Panel</h2><p className="text-slate-600">Bienvenido, <span className="font-medium">{auth.user.email}</span></p></div><div className="flex items-center gap-2"><Button variant="ghost" onClick={onOpenContact}>Contacto</Button><Button variant="secondary" onClick={auth.logout}>Salir</Button></div></div>
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4"><div className="flex gap-2"><TabBtn active={tab==="invoices"} onClick={()=>setTab("invoices")}>Facturas creadas</TabBtn><TabBtn active={tab==="help"} onClick={()=>setTab("help")}>Ayuda</TabBtn><TabBtn active={tab==="account"} onClick={()=>setTab("account")}>Cuenta</TabBtn></div>{tab==="invoices" && (<div className="flex items-center gap-3"><Badge>{plan.name==="free"?`Gratis: ${plan.remaining}/${plan.max}`:`${plan.name.toUpperCase()} (${invoices.length}/${plan.max||"∞"})`}</Badge><Button onClick={onGotoBuilder}>Nueva factura</Button></div>)}</div>
      {tab==="invoices" && (<CardBody>{invoices.length===0? (<EmptyInvoices onCreate={onGotoBuilder}/>) : (<div className="grid gap-4">{invoices.map((inv:any)=>(<div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"><div className="min-w-0"><div className="text-sm font-semibold text-slate-900">Factura #{inv.number}</div><div className="text-xs text-slate-600">{inv.date} · {inv.client?.name}</div></div><div className="flex items-center gap-2"><Button variant="ghost" onClick={()=>setPreviewing(inv)}>Visualizar</Button><Button variant="secondary" onClick={()=>onGotoBuilder(inv)}>Editar</Button><Button variant="outline" onClick={()=>onRename(inv)}>Renombrar</Button><Button variant="danger" onClick={()=>removeInvoice(inv.id)}>Eliminar</Button></div></div>))}</div>)}</CardBody>)}
      {tab==="help" && <HelpPlans auth={auth}/>} {tab==="account" && <AccountSection auth={auth}/>}
    </Card>
    <InvoicePreviewModal open={Boolean(previewing)} invoice={previewing} onClose={()=>setPreviewing(null)}/>
  </Container>);
}
const TabBtn=({active,children,...p}:any)=><button className={`rounded-xl px-3 py-2 text-sm font-medium ${active?"bg-slate-900 text-white":"text-slate-700 hover:bg-slate-100"}`} {...p}>{children}</button>;
const EmptyInvoices=({onCreate}:any)=>(<div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 p-12 text-center"><div className="mx-auto max-w-md"><h4 className="text-lg font-semibold text-slate-900">Aún no tienes facturas</h4><p className="mt-2 text-slate-600">Crea tu primera factura con una plantilla profesional.</p><Button className="mt-4" onClick={onCreate}>Crear factura</Button></div></div>);

/* Help & Account */
function HelpPlans({auth}:any){
  const data=auth.getUserData(); const plan=data?.plan||{name:"free",remaining:3,max:3}; const setPlan=(p:any)=>auth.setUserData((d:any)=>({...d,plan:p}));
  return (<CardBody className="space-y-6"><div className="grid gap-4 md:grid-cols-2">
    <FaqItem q="¿Cómo descargo mi factura?" a="Pulsa Visualizar y usa Exportar PDF (print) o Descarga HTML."/>
    <FaqItem q="¿Puedo cambiar de plantilla?" a="Sí, en el editor selecciona otra plantilla y color."/>
    <FaqItem q="¿Cómo funcionan los planes?" a="Gratis 3 facturas. Trial 0,50€ 24h (hasta 5) y pasa a Premium si no cancelas. Premium 39,90€ (15 facturas). Enterprise 79,90€ ilimitadas."/>
    <FaqItem q="¿Puedo cancelar?" a="Sí, desde Cuenta › Desuscribirse."/>
  </div>
  <div><h4 className="text-lg font-semibold text-slate-900 mb-3">Tu suscripción</h4><p className="text-sm text-slate-700 mb-4">Estado actual: <span className="font-medium uppercase">{plan.name}</span> {plan.max?`(${plan.max} máx.)`:"(ilimitadas)"}</p>
    <div className="grid gap-4 lg:grid-cols-4">
      <PlanCard title="Free" price="0€" desc="3 facturas" action={()=>setPlan({name:"free",remaining:3,max:3})}/>
      <PlanCard title="Trial" price="0,50€" desc="24h · hasta 5" note="Pasa a Premium si no cancelas" action={()=>setPlan({name:"trial",remaining:5,max:5,renewsTo:"premium"})}/>
      <PlanCard title="Premium" price="39,90€" desc="15 facturas" action={()=>setPlan({name:"premium",remaining:15,max:15})}/>
      <PlanCard title="Enterprise" price="79,90€" desc="Ilimitadas" note="Contratación explícita" action={()=>setPlan({name:"enterprise",remaining:Infinity,max:null})}/>
    </div><p className="mt-3 text-xs text-slate-600">Si contratas Trial y no cancelas en 24h, pasarás a Premium automáticamente. Enterprise requiere contratación expresa.</p></div></CardBody>);
}
const PlanCard=({title,price,desc,note,action}:any)=>(<Card><CardBody><p className="text-sm text-slate-500">{title}</p><p className="text-2xl font-bold text-slate-900">{price}</p><p className="text-sm text-slate-600">{desc}</p>{note && <p className="mt-1 text-xs text-slate-500">{note}</p>}<Button className="mt-3 w-full" onClick={action}>Seleccionar</Button></CardBody></Card>);
function AccountSection({auth}:any){
  const data=auth.getUserData();
  const unsubscribe=()=>{if(!confirm("¿Desuscribirte del plan actual?")) return; auth.setUserData((d:any)=>({...d,plan:{name:"free",remaining:3,max:3}})); alert("Suscripción cancelada. Has vuelto al plan Free.");};
  const deleteAccount=()=>{ if(!confirm("Si eliminas la cuenta se eliminarán todas tus facturas. ¿Confirmas?")) return; const s=getStore(); delete s.users[auth.user.email]; delete s.currentUser; setStore(s); location.reload();};
  return (<CardBody className="space-y-4"><div className="flex items-center justify-between rounded-xl border border-slate-200 p-4"><div><p className="text-sm font-semibold text-slate-900">Plan actual</p><p className="text-sm text-slate-600 uppercase">{data?.plan?.name}</p></div><Button variant="outline" onClick={unsubscribe}>Desuscribirse</Button></div><div className="rounded-xl border border-rose-200 bg-rose-50 p-4"><p className="text-sm font-semibold text-rose-900">Eliminar cuenta</p><p className="text-xs text-rose-800">Si eliminas tu cuenta se eliminarán todas las facturas.</p><Button className="mt-3" variant="danger" onClick={deleteAccount}>Eliminar cuenta</Button></div></CardBody>);
}
function FaqItem({q,a}:any){ const [open,setOpen]=useState(false); return (<div className="rounded-xl border border-slate-200"><button className="flex w-full items-center justify-between p-4 text-left" onClick={()=>setOpen(!open)}><span className="font-medium text-slate-900">{q}</span><svg className={`h-5 w-5 text-slate-600 transition ${open?"rotate-180":""}`} viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg></button>{open && <div className="border-t border-slate-200 p-4 text-slate-700">{a}</div>}</div>);}

/* Preview modal */
const PRINT_STYLES=`@page{size:A4;margin:24mm}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#0f172a}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{text-align:left;padding:8px;border-bottom:1px solid #e2e8f0}`;
function InvoicePreviewModal({open,onClose,invoice}:any){
  const ref=useRef<HTMLDivElement|null>(null);
  const html=()=>`<!doctype html><html><head><meta charset='utf-8'><title>Factura ${invoice?.number}</title><style>${PRINT_STYLES}</style></head><body>${ref.current?.innerHTML||""}</body></html>`;
  const download=()=>{const blob=new Blob([html()],{type:"text/html;charset=utf-8"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`factura-${invoice.number}.html`; document.body.appendChild(a); a.click(); a.remove();};
  const toPDF=()=>{const w=window.open("","_blank"); if(!w) return; w.document.write(html()); w.document.close(); w.focus(); setTimeout(()=>w.print(),300);};
  if(!open||!invoice) return null;
  return (<Modal open={open} onClose={onClose} title={`Factura #${invoice.number}`} wide>
    <div className="flex items-center justify-end gap-2 pb-3"><Button variant="secondary" onClick={download}>Descargar HTML</Button><Button onClick={toPDF}>Exportar PDF</Button></div>
    <div ref={ref}><InvoiceDocByTemplate invoice={invoice} accentColor={invoice.color} templateId={invoice.templateId}/></div>
  </Modal>);
}

/* Auth screen */
function AuthScreen({mode="login", onSubmit, switchTo}:any){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  const submit=(e:any)=>{e.preventDefault(); setError(""); try{onSubmit(email,password);}catch(err:any){setError(err.message||"Error");}};
  return (<Container className="py-16"><div className="mx-auto max-w-md"><Card><CardHeader title={mode==="login"?"Entrar":"Crear cuenta"} subtitle="Correo y contraseña"/><CardBody>
    <form onSubmit={submit} className="space-y-3"><div><label className="text-xs font-medium text-slate-600">Correo</label><Input type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} required/></div><div><label className="text-xs font-medium text-slate-600">Contraseña</label><Input type="password" value={password} onChange={(e:any)=>setPassword(e.target.value)} required/></div>{error && <p className="text-sm text-rose-600">{error}</p>}<Button className="w-full" type="submit">{mode==="login"?"Entrar":"Crear cuenta"}</Button></form>
    <div className="mt-4 flex items-center justify-between gap-2"><button className="text-sm text-slate-700 underline" onClick={switchTo}>{mode==="login"?"Crear cuenta":"Ya tengo cuenta"}</button><Button variant="outline">Continuar con Google</Button></div>
  </CardBody></Card></div></Container>);
}

/* Contact + Footer */
function ContactModal({open,onClose}:any){
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [msg,setMsg]=useState(""); const [sent,setSent]=useState(false);
  const submit=(e:any)=>{e.preventDefault(); setSent(true); setTimeout(()=>onClose(),900);};
  return (<Modal open={open} onClose={onClose} title="Contacto">{sent?(<div className="grid place-items-center p-10 text-center"><div className="mb-2 h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center"><svg viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg></div><p className="text-slate-800">¡Mensaje enviado! Te responderemos pronto.</p></div>):(<form onSubmit={submit} className="space-y-3"><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-medium text-slate-600">Nombre</label><Input value={name} onChange={(e:any)=>setName(e.target.value)} required/></div><div><label className="text-xs font-medium text-slate-600">Correo</label><Input type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} required/></div></div><div><label className="text-xs font-medium text-slate-600">Mensaje</label><Textarea rows={5} value={msg} onChange={(e:any)=>setMsg(e.target.value)} required placeholder="¿En qué podemos ayudarte?"/></div><div className="flex justify-end gap-2"><Button variant="secondary" type="button" onClick={onClose}>Cerrar</Button><Button type="submit">Enviar</Button></div></form>)}</Modal>);
}
function Footer(){ return (<footer className="border-t border-slate-200 py-10"><Container><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="flex items-center gap-3"><img src="/logo.svg" className="h-6 w-6 rounded" alt="logo"/><p className="text-sm text-slate-600">© {new Date().getFullYear()} Facturakit. Todos los derechos reservados.</p></div><div className="flex items-center gap-4 text-sm"><a className="text-slate-600 hover:text-slate-900" href="#">Términos</a><a className="text-slate-600 hover:text-slate-900" href="#">Privacidad</a></div></div></Container></footer>);}

/* App root (routes) */
export default function App(){
  const auth=useAuth();
  const [route,setRoute]=useState("home"); const [contactOpen,setContactOpen]=useState(false);
  const [templateModal,setTemplateModal]=useState<any>(null);
  const [pickedTemplate,setPickedTemplate]=useState<any>(null);
  const [builderInvoice,setBuilderInvoice]=useState<any>(null);
  const [authGateOpen,setAuthGateOpen]=useState(false);
  const [successModal,setSuccessModal]=useState<any>(null);
  useEffect(()=>{if(auth.user && route==="home") setRoute("dashboard");},[auth.user]);

  const pushInvoice=(auth:any, invoice:any)=>{const s=getStore(); const ud=s.users?.[auth.user.email]; const newInv={...invoice,id:invoice.id||uid()}; const next=[newInv,...(ud?.invoices||[])]; s.users[auth.user.email].invoices=next; const plan=s.users[auth.user.email].plan||{name:"free",remaining:3,max:3}; if(plan.name!=="enterprise" && plan.remaining!==Infinity && plan.remaining>0) plan.remaining-=1; setStore(s);};
  const handleProceed=(invoice:any)=>{ if(!auth.user){ setBuilderInvoice(invoice); setAuthGateOpen(true); return;} pushInvoice(auth,invoice); setSuccessModal(invoice); };

  return (<div className="min-h-screen bg-white text-slate-900">
    <Header onGoto={setRoute} user={auth.user} onOpenContact={()=>setContactOpen(true)}/>
    {route==="home"&&<Home onGoto={setRoute}/>}
    {route==="templates"&&<Templates onPick={(t:any)=>{setPickedTemplate(t); setRoute("builder");}} onPreviewTemplate={(t:any)=>setTemplateModal(t)}/>}
    {route==="builder"&&<Builder template={pickedTemplate||TEMPLATES[0]} initial={builderInvoice} onBack={()=>setRoute("templates")} onProceed={(inv:any)=>handleProceed({...inv,id:inv.id||uid()})} auth={auth}/>}
    {route==="login"&&<AuthScreen mode="login" onSubmit={(e:string,p:string)=>auth.login(e,p)} switchTo={()=>setRoute("signup")}/>}
    {route==="signup"&&<AuthScreen mode="signup" onSubmit={(e:string,p:string)=>auth.signup(e,p)} switchTo={()=>setRoute("login")}/>}
    {route==="dashboard"&&auth.user&&<Dashboard auth={auth} onOpenContact={()=>setContactOpen(true)} onGotoBuilder={()=>{setPickedTemplate(TEMPLATES[0]); setRoute("builder");}} onRename={(inv:any)=>{const name=prompt("Nuevo número/nombre",inv.number); if(!name) return; const s=getStore(); const list=s.users[auth.user.email].invoices.map((x:any)=>x.id===inv.id?{...x,number:name}:x); s.users[auth.user.email].invoices=list; setStore(s); }}/>}
    <Footer/>
    <Modal open={Boolean(templateModal)} onClose={()=>setTemplateModal(null)} title={`Ejemplo · ${templateModal?.name}`} wide>
      {templateModal && (<div className="space-y-4"><InvoiceDocByTemplate invoice={{...DEFAULT_SAMPLE, templateId:templateModal.id, color:templateModal.colors[0]}} accentColor={templateModal.colors[0]} templateId={templateModal.id}/><div className="flex justify-end"><Button onClick={()=>{setPickedTemplate(templateModal); setTemplateModal(null); setRoute("builder");}}>Usar esta plantilla</Button></div></div>)}
    </Modal>
    <AuthGateModal open={authGateOpen} onClose={()=>setAuthGateOpen(false)} onAuthed={(inv:any)=>{setAuthGateOpen(false); setRoute("success"); pushInvoice(auth,inv); setSuccessModal(inv);}} auth={auth} nextInvoice={builderInvoice}/>
    <Modal open={Boolean(successModal) && route!=="dashboard"} onClose={()=>setSuccessModal(null)} title="¡Felicidades!" wide>
      <p className="text-slate-700">Tu factura está lista para descargar.</p>
      <div className="my-4">{successModal && <InvoiceDocByTemplate invoice={successModal} accentColor={successModal.color} templateId={successModal.templateId}/>}</div>
      <div className="flex justify-end gap-2"><Button variant="secondary" onClick={()=>setSuccessModal(null)}>Cerrar</Button></div>
    </Modal>
    <ContactModal open={contactOpen} onClose={()=>setContactOpen(false)}/>
  </div>);
}
