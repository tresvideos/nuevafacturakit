
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------- UI helpers ---------- */
const Container = ({ className = "", children }: any) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);
const Card = ({ className = "", children }: any) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ title, subtitle, right, className = "" }: any) => (
  <div className={`flex items-start justify-between gap-4 p-5 ${className}`}>
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {right}
  </div>
);
const CardBody = ({ className = "", children }: any) => <div className={`p-5 ${className}`}>{children}</div>;
const Button = ({ children, className = "", variant = "primary", ...props }: any) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  const variants: any = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900/20",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300",
    danger: "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-600/20",
    outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 focus:ring-slate-300",
    success: "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-600/20",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
const Input = ({ className = "", ...props }: any) => (
  <input
    className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`}
    {...props}
  />
);
const Select = ({ className = "", children, ...props }: any) => (
  <select
    className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`}
    {...props}
  >
    {children}
  </select>
);
const Textarea = ({ className = "", ...props }: any) => (
  <textarea
    className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`}
    {...props}
  />
);
const Badge = ({ children, className = "" }: any) => (
  <span
    className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ${className}`}
  >
    {children}
  </span>
);
const Divider = () => <div className="h-px w-full bg-slate-200" />;
const Modal = ({ open, onClose, title, children, wide = false }: any) =>
  !open ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className={`relative z-10 max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl ${wide ? "w-[1080px]" : "w-[720px]"}`}>
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-600">
              <path
                fill="currentColor"
                d="M6.4 4.98 4.98 6.4 10.59 12l-5.6 5.6L6.4 19.98 12 14.41l5.6 5.57 1.41-1.41L13.41 12l5.6-5.6L17.6 4.98 12 10.59z"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );

/* ---------- Utils & Store ---------- */
const uid = () => Math.random().toString(36).slice(2);
const currency = (n: any) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(n || 0));
const LS_KEY = "invoice_saas_v7";
const getStore = (): any => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
};
const setStore = (o: any) => localStorage.setItem(LS_KEY, JSON.stringify(o));

function useAuth() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const s = getStore();
    if (s.currentUser) setUser(s.currentUser);
  }, []);
  const signup = (email: string, password: string) => {
    const s = getStore();
    s.users = s.users || {};
    if (s.users[email]) throw new Error("Este correo ya está registrado.");
    s.users[email] = { email, password, invoices: [], plan: { name: "free", remaining: 3, max: 3 } };
    s.currentUser = { email };
    setStore(s);
    setUser({ email });
  };
  const login = (email: string, password: string) => {
    const s = getStore();
    if (!s.users || !s.users[email]) throw new Error("Usuario no encontrado.");
    if (s.users[email].password !== password) throw new Error("Contraseña incorrecta.");
    s.currentUser = { email };
    setStore(s);
    setUser({ email });
  };
  const logout = () => {
    const s = getStore();
    delete s.currentUser;
    setStore(s);
    setUser(null);
  };
  const getUserData = () => {
    const s = getStore();
    return s.users?.[user?.email] || null;
  };
  const setUserData = (updater: any) => {
    const s = getStore();
    if (!user) return;
    const d = s.users?.[user.email];
    s.users[user.email] = typeof updater === "function" ? updater(d) : updater;
    setStore(s);
  };
  return { user, signup, login, logout, getUserData, setUserData };
}

/* ---------- Templates ---------- */
const TEMPLATES = [
  { id: "minimal", name: "Minimal", style: "bg-slate-900", colors: ["#0f172a", "#1f2937", "#334155"], vibe: "Sobrio" },
  { id: "classic", name: "Clásica", style: "bg-indigo-600", colors: ["#4338ca", "#3730a3", "#312e81"], vibe: "Formal" },
  { id: "modern", name: "Moderna", style: "bg-emerald-600", colors: ["#059669", "#047857", "#065f46"], vibe: "Actual" },
  { id: "elegant", name: "Elegante", style: "bg-rose-600", colors: ["#e11d48", "#be123c", "#9f1239"], vibe: "Premium" },
  { id: "tech", name: "Tech", style: "bg-cyan-600", colors: ["#0891b2", "#0e7490", "#155e75"], vibe: "Start-up" },
  { id: "bold", name: "Bold", style: "bg-amber-500", colors: ["#f59e0b", "#d97706", "#b45309"], vibe: "Destacado" },
  { id: "mono", name: "Monocromo", style: "bg-neutral-800", colors: ["#0a0a0a", "#262626", "#525252"], vibe: "Minimal extremo" },
  { id: "art", name: "Artístico", style: "bg-fuchsia-600", colors: ["#c026d3", "#a21caf", "#86198f"], vibe: "Creativo" },
  { id: "paper", name: "Papel", style: "bg-lime-600", colors: ["#65a30d", "#4d7c0f", "#3f6212"], vibe: "Clásico moderno" },
  { id: "blueprint", name: "Blueprint", style: "bg-blue-700", colors: ["#1d4ed8", "#1e40af", "#1e3a8a"], vibe: "Ingeniería" },
];

const DEFAULT_SAMPLE: any = {
  number: "0001",
  date: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
  purchaseOrder: "PO-2025-001",
  paymentMethod: "Transferencia",
  bankIban: "ES12 3456 7890 1234 5678 9012",
  issuer: { name: "Tu Empresa S.L.", nif: "B12345678", address: "Calle Mayor 1, Madrid", email: "facturas@empresa.com", phone: "+34 600 000 000" },
  client: { name: "Cliente Demo", nif: "00000000A", address: "C/ Falsa 123, Barcelona", email: "cliente@demo.com" },
  items: [
    { id: uid(), description: "Servicio profesional", qty: 1, price: 300 },
    { id: uid(), description: "Soporte", qty: 2, price: 50 },
  ],
  notes: "Gracias por su confianza.",
  terms: "Pago a 7 días. Recargo por demora 1%.",
  logo: "/logo.png",
  color: TEMPLATES[0].colors[0],
  discount: { mode: "percent", value: 0 },
  taxRate: 21,
  templateId: "minimal",
};

/* ---------- Header ---------- */
function Header({ onGoto, user, onOpenContact }: any) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Facturakit" className="h-9 w-9 rounded-lg" />
            <span className="hidden text-sm font-semibold text-slate-900 sm:block">Facturakit</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onGoto("home")} className="hidden sm:inline-flex">Inicio</Button>
            <Button variant="ghost" onClick={() => onGoto("templates")} className="hidden sm:inline-flex">Plantillas</Button>
            <Button variant="ghost" onClick={onOpenContact} className="hidden sm:inline-flex">Contacto</Button>
            {user ? <Button onClick={() => onGoto("dashboard")}>Panel</Button> : <><Button variant="secondary" onClick={() => onGoto("login")}>Entrar</Button><Button onClick={() => onGoto("signup")}>Crear cuenta</Button></>}
          </nav>
        </div>
      </Container>
    </header>
  );
}

/* ---------- Home (hero + secciones) ---------- */
function Home({ onGoto }: any) {
  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <Container className="py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge>Nuevo • V7.3</Badge>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Crea facturas profesionales en minutos</h1>
              <p className="mt-4 text-lg text-slate-600">Elige entre <span className="font-semibold">10 plantillas únicas</span>, personaliza colores, logo y datos, y descarga en <span className="font-semibold">PDF o HTML</span>. Las <span className="font-semibold">3 primeras</span> son gratis.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => onGoto("templates")} variant="success">Empezar ahora</Button>
                <Button variant="secondary" onClick={() => onGoto("templates")}>Ver plantillas</Button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-slate-600">
                <div className="flex -space-x-2">
                  {["Ana López", "Carlos Pérez", "María Ruiz", "Jorge Díaz"].map((n) => (
                    <div key={n} className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 grid place-items-center text-xs font-semibold text-slate-700">{n.split(" ").map((p) => p[0]).join("")}</div>
                  ))}
                </div>
                <span>+1.200 creadores confían en Facturakit</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <TemplatesStrip />
              <p className="mt-3 text-center text-xs text-slate-500">10 estilos listos para usar</p>
            </div>
          </div>
        </Container>
      </section>

      {/* BENEFICIOS */}
      <section>
        <Container className="py-14">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Plantillas únicas", d: "Minimal, clásica, moderna, artística y más." },
              { t: "Editor completo", d: "Logo, colores, descuentos en % o € y vista previa en vivo." },
              { t: "Exportar en 1 clic", d: "Descarga en PDF (print) o HTML listos para enviar." },
              { t: "Panel de control", d: "Edita, renombra, elimina y gestiona tus facturas." },
            ].map((f) => (
              <Card key={f.t}><CardBody><h3 className="text-base font-semibold text-slate-900">{f.t}</h3><p className="mt-1 text-sm text-slate-600">{f.d}</p></CardBody></Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-slate-50">
        <Container className="py-16">
          <h2 className="text-center text-2xl font-bold text-slate-900">Cómo funciona</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {["Elige la plantilla", "Rellena tus datos", "Descarga la factura"].map((s, i) => (
              <Card key={s}><CardBody>
                <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white">{i + 1}</div><h3 className="text-base font-semibold text-slate-900">{s}</h3></div>
                <p className="mt-2 text-sm text-slate-600">{i === 0 ? "10 estilos diferentes con mini‑previews reales." : i === 1 ? "Logo, colores, conceptos, impuestos y descuentos." : "PDF o HTML listos para enviar."}</p>
              </CardBody></Card>
            ))}
          </div>
          <div className="mt-8 text-center"><Button onClick={() => onGoto("templates")}>Probar ahora</Button></div>
        </Container>
      </section>

      {/* RESEÑAS */}
      <section>
        <Container className="py-16">
          <h2 className="text-center text-2xl font-bold text-slate-900">Opiniones</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[{ n: "Ana López", t: "Diseñadora" }, { n: "Diego Martín", t: "Autónomo" }, { n: "Laura Pérez", t: "Consultora" }].map((r) => (
              <Card key={r.n}><CardBody>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 grid place-items-center font-semibold text-slate-700">{r.n.split(" ").map((p) => p[0]).join("")}</div>
                  <div><p className="text-sm font-semibold text-slate-900">{r.n}</p><p className="text-xs text-slate-500">{r.t}</p></div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-amber-500">{"★★★★★".split("").map((s, i) => (<span key={i}>★</span>))}</div>
                <p className="mt-2 text-sm text-slate-700">“Muy fácil y rápido. Las plantillas se ven súper profesionales.”</p>
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

const TemplatesStrip = () => (
  <div className="grid grid-cols-5 gap-2">
    {TEMPLATES.slice(0, 10).map((t) => (
      <div key={t.id} className={`h-20 rounded-xl ${t.style} text-white grid place-items-center text-xs font-semibold`}>{t.name}</div>
    ))}
  </div>
);

/* ---------- Templates gallery with real mini previews ---------- */
function Templates({ onPick, onPreviewTemplate }: any) {
  return (
    <Container className="py-12">
      <h2 className="text-2xl font-bold text-slate-900">Elige una plantilla</h2>
      <p className="mt-2 text-slate-600">Clásicas, modernas y artísticas. Previsualiza antes de usar.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {TEMPLATES.map((t) => (
          <Card key={t.id}>
            <CardHeader title={`${t.name}`} subtitle={t.vibe} right={<Badge>Demo</Badge>} />
            <CardBody>
              <MiniInvoicePreview templateId={t.id} />
              <div className="mt-3 flex items-center justify-between gap-2">
                <Button variant="secondary" onClick={() => onPreviewTemplate(t)}>Ver ejemplo</Button>
                <Button onClick={() => onPick(t)}>Usar</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </Container>
  );
}

/* ---------- Builder ---------- */
function Builder({ template, initial, onBack, onProceed, auth }: any) {
  const [inv, setInv] = useState<any>(() => ({ ...(initial || DEFAULT_SAMPLE), templateId: template?.id || DEFAULT_SAMPLE.templateId, color: template?.colors?.[0] || DEFAULT_SAMPLE.color }));
  const change = (patch: any) => setInv((x: any) => ({ ...x, ...patch }));
  const updateIssuer = (k: string, v: any) => change({ issuer: { ...inv.issuer, [k]: v } });
  const updateClient = (k: string, v: any) => change({ client: { ...inv.client, [k]: v } });
  const updateItem = (id: string, patch: any) => change({ items: inv.items.map((it: any) => (it.id === id ? { ...it, ...patch } : it)) });
  const addItem = () => change({ items: [...inv.items, { id: uid(), description: "Nuevo concepto", qty: 1, price: 0 }] });
  const removeItem = (id: string) => change({ items: inv.items.filter((it: any) => it.id !== id) });
  const onLogo = (e: any) => { const f = e.target.files?.[0]; if (!f) return; const reader = new FileReader(); reader.onload = () => change({ logo: reader.result }); reader.readAsDataURL(f); };
  const totals = useMemo(() => calcTotals(inv.items, inv.discount, inv.taxRate), [inv.items, inv.discount, inv.taxRate]);
  const proceed = () => onProceed(inv);

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="secondary" onClick={onBack}>Volver</Button>
        <Badge>Plantilla: {template?.name}</Badge>
        {/* Cambio en caliente de plantilla */}
        <Select className="w-auto" value={inv.templateId} onChange={(e: any) => change({ templateId: e.target.value })}>
          {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario */}
        <Card>
          <CardHeader title="Datos de la factura" subtitle="Completa todos los campos necesarios" />
          <CardBody className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-slate-600">Nº factura</label><Input value={inv.number} onChange={(e: any) => change({ number: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-slate-600">Fecha</label><Input type="date" value={inv.date} onChange={(e: any) => change({ date: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-slate-600">Vencimiento</label><Input type="date" value={inv.dueDate} onChange={(e: any) => change({ dueDate: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-slate-600">Pedido/PO</label><Input value={inv.purchaseOrder} onChange={(e: any) => change({ purchaseOrder: e.target.value })} /></div>
            </div>
            <Card className="border-slate-200">
              <CardHeader title="Emisor" />
              <CardBody className="grid grid-cols-2 gap-3">
                <Input placeholder="Nombre" value={inv.issuer.name} onChange={(e: any) => updateIssuer("name", e.target.value)} />
                <Input placeholder="NIF/CIF" value={inv.issuer.nif} onChange={(e: any) => updateIssuer("nif", e.target.value)} />
                <Input placeholder="Dirección" value={inv.issuer.address} onChange={(e: any) => updateIssuer("address", e.target.value)} />
                <Input placeholder="Email" value={inv.issuer.email} onChange={(e: any) => updateIssuer("email", e.target.value)} />
                <Input placeholder="Teléfono" value={inv.issuer.phone} onChange={(e: any) => updateIssuer("phone", e.target.value)} />
                <div><label className="text-xs font-medium text-slate-600">Logo</label><Input type="file" accept="image/*" onChange={onLogo} /></div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Cliente" />
              <CardBody className="grid grid-cols-2 gap-3">
                <Input placeholder="Nombre" value={inv.client.name} onChange={(e: any) => updateClient("name", e.target.value)} />
                <Input placeholder="NIF" value={inv.client.nif} onChange={(e: any) => updateClient("nif", e.target.value)} />
                <Input placeholder="Dirección" value={inv.client.address} onChange={(e: any) => updateClient("address", e.target.value)} />
                <Input placeholder="Email" value={inv.client.email} onChange={(e: any) => updateClient("email", e.target.value)} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Conceptos" right={<Button variant="secondary" onClick={addItem}>Añadir</Button>} />
              <CardBody className="space-y-3">
                {inv.items.map((it: any) => (
                  <div key={it.id} className="grid grid-cols-12 items-center gap-2">
                    <Input className="col-span-6" value={it.description} onChange={(e: any) => updateItem(it.id, { description: e.target.value })} />
                    <Input className="col-span-2" type="number" min="0" step="1" value={it.qty} onChange={(e: any) => updateItem(it.id, { qty: Number(e.target.value) })} />
                    <Input className="col-span-3" type="number" min="0" step="0.01" value={it.price} onChange={(e: any) => updateItem(it.id, { price: Number(e.target.value) })} />
                    <button className="col-span-1 rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={() => removeItem(it.id)} aria-label="Eliminar">×</button>
                  </div>
                ))}
              </CardBody>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-slate-600">Impuestos (%)</label><Input type="number" min="0" step="0.1" value={inv.taxRate} onChange={(e: any) => change({ taxRate: Number(e.target.value) })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={inv.discount.mode} onChange={(e: any) => change({ discount: { ...inv.discount, mode: e.target.value } })}><option value="percent">Descuento %</option><option value="amount">Descuento €</option></Select>
                <Input type="number" min="0" step="0.01" value={inv.discount.value} onChange={(e: any) => change({ discount: { ...inv.discount, value: Number(e.target.value) } })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-slate-600">Método de pago</label><Input value={inv.paymentMethod} onChange={(e: any) => change({ paymentMethod: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-slate-600">IBAN / Banco</label><Input value={inv.bankIban} onChange={(e: any) => change({ bankIban: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Color de acento</label>
                <div className="flex flex-wrap gap-2">
                  {(TEMPLATES.find((x) => x.id === inv.templateId)?.colors || []).map((c: string) => (
                    <button key={c} className={`h-8 w-8 rounded-full ring-2 ${inv.color === c ? "ring-slate-900" : "ring-transparent"}`} style={{ background: c }} onClick={() => change({ color: c })} type="button" />
                  ))}
                </div>
              </div>
              <div />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-slate-600">Notas</label><Textarea rows={3} value={inv.notes} onChange={(e: any) => change({ notes: e.target.value })} /></div>
              <div><label className="text-xs font-medium text-slate-600">Términos</label><Textarea rows={3} value={inv.terms} onChange={(e: any) => change({ terms: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={onBack}>Atrás</Button>
              <Button onClick={proceed}>Descargar factura</Button>
            </div>
          </CardBody>
        </Card>

        {/* Preview */}
        <div className="space-y-3">
          <Card>
            <CardHeader title="Previsualización" subtitle="Actualiza en tiempo real" />
            <CardBody><InvoiceDocByTemplate invoice={inv} accentColor={inv.color} templateId={inv.templateId} /></CardBody>
          </Card>
          <Card>
            <CardHeader title="Totales" />
            <CardBody><TotalsView totals={totals} /></CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}

/* ---------- Totals ---------- */
const calcTotals = (items: any[], discount: any = { mode: "percent", value: 0 }, taxRate = 21) => {
  const subtotal = items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.price || 0), 0);
  const discountValue = discount.mode === "percent" ? (subtotal * (discount.value || 0)) / 100 : (discount.value || 0);
  const base = Math.max(0, subtotal - discountValue);
  const taxes = (base * Number(taxRate || 0)) / 100;
  return { subtotal, discount: discountValue, base, taxes, total: base + taxes };
};
const TotalsView = ({ totals }: any) => (
  <div className="space-y-1 text-sm">
    <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{currency(totals.subtotal)}</span></div>
    <div className="flex justify-between"><span className="text-slate-600">Descuento</span><span className="font-medium">-{currency(totals.discount)}</span></div>
    <div className="flex justify-between"><span className="text-slate-600">Base imponible</span><span className="font-medium">{currency(totals.base)}</span></div>
    <div className="flex justify-between"><span className="text-slate-600">IVA</span><span className="font-medium">{currency(totals.taxes)}</span></div>
    <Divider />
    <div className="flex justify-between text-base font-semibold"><span>Total</span><span>{currency(totals.total)}</span></div>
  </div>
);

/* ---------- Invoice variants (for previews and print) ---------- */
function InvoiceDocByTemplate({ invoice, templateId, accentColor, compact=false }: any) {
  const items = invoice.items || [];
  const totals = calcTotals(items, invoice.discount, invoice.taxRate);
  const accent = { color: accentColor || invoice.color || "#0f172a" };
  const scale = compact ? "scale-75 origin-top" : "scale-100";
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${compact ? "h-48 overflow-hidden" : "p-6"}`}>
      {templateId === "classic" && (<>
        <HeaderBlock invoice={invoice} accent={accent} variant="band" />
        <TwoCols invoice={invoice} />
        <ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="bordered" />
        {!compact && <NotesTerms invoice={invoice} />}
      </>)}
      {templateId === "modern" && (
        <div className={scale}>
          <div className="flex items-start justify-between">
            <div><h2 className="text-xl font-bold">Factura #{invoice.number}</h2><p className="text-sm text-slate-600">{invoice.date} · Vence {invoice.dueDate}</p></div>
            <div className="rounded-xl px-3 py-1 text-xs text-white" style={{ background: accent.color }}>Total {currency(totals.total)}</div>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold">Cliente</p><p className="text-sm">{invoice.client?.name}</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold">Pago</p><p className="text-sm">{invoice.paymentMethod}</p></div>
          </div>
          <ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="striped" compact={compact} />
        </div>
      )}
      {templateId === "elegant" && (
        <div className={scale}>
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <div><p className="text-sm font-semibold" style={{ color: accent.color }}>FACTURA</p><h2 className="text-xl font-bold">{invoice.issuer?.name}</h2></div>
            {invoice.logo && <img src={invoice.logo} className="h-10 object-contain" />}
          </div>
          <TwoCols invoice={invoice} subtle />
          <ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="clean" compact={compact} />
        </div>
      )}
      {templateId === "tech" && (
        <div className={scale}>
          <div className="rounded-lg p-3 text-white" style={{ background: accent.color }}>
            <div className="flex items-center justify-between"><b>Factura #{invoice.number}</b><span>{invoice.date}</span></div>
          </div>
          <TwoCols invoice={invoice} inverted />
          <ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="grid" compact={compact} />
        </div>
      )}
      {templateId === "bold" && (
        <div className={scale}>
          <HeaderBlock invoice={invoice} accent={accent} variant="big" />
          <TwoCols invoice={invoice} />
          <ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="thick" compact={compact} />
        </div>
      )}
      {templateId === "mono" && (
        <div className={scale}>
          <HeaderBlock invoice={invoice} accent={{ color: "#111" }} mono />
          <TwoCols invoice={invoice} mono />
          <ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={{ color: "#111" }} variant="mono" compact={compact} />
        </div>
      )}
      {templateId === "art" && (
        <div className={scale}>
          <div className="flex gap-4">
            <div className="hidden w-2 rounded-lg sm:block" style={{ background: accent.color }} />
            <div className="flex-1">
              <HeaderBlock invoice={invoice} accent={accent} variant="chip" />
              <TwoCols invoice={invoice} />
              <ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="dotted" compact={compact} />
            </div>
          </div>
        </div>
      )}
      {templateId === "paper" && (
        <div className={scale}>
          <div className="rounded-lg border border-slate-300 p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.02)]">
            <HeaderBlock invoice={invoice} accent={accent} variant="chip" />
            <TwoCols invoice={invoice} />
            <ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="bordered" compact={compact} />
          </div>
        </div>
      )}
      {templateId === "blueprint" && (
        <div className={scale}>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <HeaderBlock invoice={invoice} accent={{ color: "#1d4ed8" }} variant="band" />
            <TwoCols invoice={invoice} subtle />
            <ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={{ color: "#1d4ed8" }} variant="grid" compact={compact} />
          </div>
        </div>
      )}
      {templateId === "minimal" && (<div className={scale}><HeaderBlock invoice={invoice} accent={accent} variant="chip" /><TwoCols invoice={invoice} /><ItemsTable items={items} totals={totals} taxRate={invoice.taxRate} accent={accent} variant="simple" compact={compact} /></div>)}
    </div>
  );
}

function HeaderBlock({ invoice, accent, variant="chip", mono=false }: any) {
  return (
    <div className={`flex items-start justify-between gap-6 ${variant === "band" ? "rounded-lg p-3 text-white" : ""}`} style={variant === "band" ? { background: accent.color } : {}}>
      <div>
        {variant !== "big" && variant !== "band" && (<div className={`inline-block rounded-full px-2 py-0.5 text-xs ${mono ? "text-white bg-black" : "text-white"}`} style={variant === "chip" ? { background: accent.color } : {}}>{variant === "band" ? "" : "Factura"}</div>)}
        <h2 className={`mt-2 font-bold ${variant === "big" ? "text-3xl" : "text-xl"}`}>#{invoice.number}</h2>
        <p className={`text-sm ${mono ? "text-neutral-600" : "text-slate-600"}`}>Fecha: {invoice.date} · Vencimiento: {invoice.dueDate}</p>
      </div>
      <div className="text-right">
        {invoice.logo && <img src={invoice.logo as string} alt="logo" className="ml-auto mb-2 h-10 object-contain" />}
        <h3 className={`text-sm font-semibold ${mono ? "text-neutral-900" : "text-slate-900"}`}>{invoice.issuer?.name}</h3>
        <p className={`text-xs ${mono ? "text-neutral-600" : "text-slate-600"}`}>{invoice.issuer?.nif}</p>
      </div>
    </div>
  );
}
function TwoCols({ invoice, subtle=false, inverted=false, mono=false }: any) {
  return (
    <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
      <div className={`${subtle ? "rounded-lg bg-slate-50 p-3" : ""} ${mono ? "text-neutral-700" : ""}`}>
        <p className={`font-semibold ${mono ? "text-neutral-900" : "text-slate-900"}`}>Facturar a</p>
        <p className="text-slate-700">{invoice.client?.name}</p>
        <p className="text-slate-500">{invoice.client?.nif}</p>
      </div>
      <div className={`${inverted ? "rounded-lg text-white p-3" : ""}`} style={inverted ? { background: "#0ea5b7" } : {}}>
        <p className={`font-semibold ${inverted ? "text-white" : "text-slate-900"}`}>Pago</p>
        <p className={`${inverted ? "text-white/90" : "text-slate-700"}`}>{invoice.paymentMethod}</p>
        <p className={`${inverted ? "text-white/80" : "text-slate-500"}`}>{invoice.bankIban}</p>
      </div>
    </div>
  );
}
function ItemsTable({ items, totals, taxRate, accent, variant="simple", compact=false }: any) {
  const th = variant === "mono" ? "text-neutral-700" : "text-slate-600";
  const tableCls = variant === "bordered" ? "border border-slate-200" : variant === "thick" ? "border-t-2 border-b-2 border-slate-900" : "";
  return (
    <div className={`mt-4 overflow-x-auto ${compact ? "text-[12px]" : ""}`}>
      <table className={`min-w-full ${tableCls}`}>
        <thead>
          <tr className={th}>
            <th className="w-2/3">Descripción</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it: any, i: number) => (
            <tr key={i} className={variant === "striped" && i % 2 ? "bg-slate-50" : ""}>
              <td>{it.description}</td>
              <td>{it.qty}</td>
              <td>{currency(it.price)}</td>
              <td>{currency(Number(it.qty) * Number(it.price))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 ml-auto w-full max-w-xs text-sm">
        <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">{currency(totals.subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-slate-600">Descuento</span><span className="font-medium">-{currency(totals.discount)}</span></div>
        <div className="flex justify-between"><span className="text-slate-600">Base</span><span className="font-medium">{currency(totals.base)}</span></div>
        <div className="flex justify-between"><span className="text-slate-600">IVA ({taxRate}%)</span><span className="font-medium">{currency(totals.taxes)}</span></div>
        <Divider />
        <div className="flex justify-between text-base font-semibold"><span>Total</span><span style={{ color: accent.color }}>{currency(totals.total)}</span></div>
      </div>
    </div>
  );
}
function NotesTerms({ invoice }: any) {
  return invoice.notes || invoice.terms ? (
    <div className="mt-4 grid gap-4 text-xs md:grid-cols-2">
      {invoice.notes && <div><p className="font-semibold text-slate-900">Notas</p><p className="text-slate-700 whitespace-pre-wrap">{invoice.notes}</p></div>}
      {invoice.terms && <div><p className="font-semibold text-slate-900">Términos</p><p className="text-slate-700 whitespace-pre-wrap">{invoice.terms}</p></div>}
    </div>
  ) : null;
}

/* ---------- Auth gate ---------- */
function AuthGateModal({ open, onClose, onAuthed, auth, nextInvoice }: any) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (e: any) => {
    e.preventDefault(); setError("");
    try { mode === "login" ? auth.login(email, password) : auth.signup(email, password); onAuthed(nextInvoice); }
    catch (err: any) { setError(err.message || "Error"); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Crea tu cuenta o entra">
      <p className="mb-3 text-sm text-slate-600">Regístrate o inicia sesión para descargar tu factura.</p>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-slate-600">Correo</label><Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required /></div>
          <div><label className="text-xs font-medium text-slate-600">Contraseña</label><Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required /></div>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button className="w-full" type="submit">{mode === "login" ? "Entrar" : "Crear cuenta"}</Button>
      </form>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button className="text-sm text-slate-700 underline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}</button>
        <Button variant="outline">Continuar con Google</Button>
      </div>
    </Modal>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ auth, onOpenContact, onGotoBuilder, onRename }: any) {
  const data = auth.getUserData();
  const invoices = data?.invoices || [];
  const plan = data?.plan || { name: "free", remaining: 3, max: 3 };
  const [tab, setTab] = useState<"invoices" | "help" | "account">("invoices");
  const [previewing, setPreviewing] = useState<any>(null);

  const removeInvoice = (id: string) => {
    if (!confirm("¿Eliminar esta factura?")) return;
    const next = invoices.filter((i: any) => i.id !== id);
    auth.setUserData((d: any) => ({ ...d, invoices: next }));
  };

  return (
    <Container className="py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-bold text-slate-900">Panel</h2><p className="text-slate-600">Bienvenido, <span className="font-medium">{auth.user.email}</span></p></div>
        <div className="flex items-center gap-2"><Button variant="ghost" onClick={onOpenContact}>Contacto</Button><Button variant="secondary" onClick={auth.logout}>Salir</Button></div>
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="flex gap-2"><TabBtn active={tab === "invoices"} onClick={() => setTab("invoices")}>Facturas creadas</TabBtn><TabBtn active={tab === "help"} onClick={() => setTab("help")}>Ayuda</TabBtn><TabBtn active={tab === "account"} onClick={() => setTab("account")}>Cuenta</TabBtn></div>
          {tab === "invoices" && (<div className="flex items-center gap-3"><Badge>{plan.name === "free" ? `Gratis: ${plan.remaining}/${plan.max}` : `${plan.name.toUpperCase()} (${invoices.length}/${plan.max || "∞"})`}</Badge><Button onClick={onGotoBuilder}>Nueva factura</Button></div>)}
        </div>
        {tab === "invoices" && (<CardBody>
          {invoices.length === 0 ? (<EmptyInvoices onCreate={onGotoBuilder} />) : (
            <div className="grid gap-4">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="min-w-0"><div className="text-sm font-semibold text-slate-900">Factura #{inv.number}</div><div className="text-xs text-slate-600">{inv.date} · {inv.client?.name}</div></div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => setPreviewing(inv)}>Visualizar</Button>
                    <Button variant="secondary" onClick={() => onGotoBuilder(inv)}>Editar</Button>
                    <Button onClick={() => downloadHTML(inv)}>Descargar HTML</Button>
                    <Button onClick={() => exportPDF(inv)}>Exportar PDF</Button>
                    <Button variant="outline" onClick={() => onRename(inv)}>Renombrar</Button>
                    <Button variant="danger" onClick={() => removeInvoice(inv.id)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>)}
        {tab === "help" && <HelpPlans auth={auth} />}
        {tab === "account" && <AccountSection auth={auth} />}
      </Card>
      <InvoicePreviewModal open={Boolean(previewing)} invoice={previewing} onClose={() => setPreviewing(null)} />
    </Container>
  );
}
const TabBtn = ({ active, children, ...p }: any) => (<button className={`rounded-xl px-3 py-2 text-sm font-medium ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`} {...p}>{children}</button>);
const EmptyInvoices = ({ onCreate }: any) => (<div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 p-12 text-center"><div className="mx-auto max-w-md"><h4 className="text-lg font-semibold text-slate-900">Aún no tienes facturas</h4><p className="mt-2 text-slate-600">Crea tu primera factura con una plantilla profesional.</p><Button className="mt-4" onClick={onCreate}>Crear factura</Button></div></div>);

/* ---------- Help / Plans ---------- */
function HelpPlans({ auth }: any) {
  const data = auth.getUserData();
  const plan = data?.plan || { name: "free", remaining: 3, max: 3 };
  const setPlan = (p: any) => auth.setUserData((d: any) => ({ ...d, plan: p }));
  return (
    <CardBody className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FaqItem q="¿Cómo descargo mi factura?" a="Pulsa Visualizar y usa PDF o Descarga HTML." />
        <FaqItem q="¿Puedo cambiar de plantilla?" a="Sí, en el editor selecciona otra plantilla y color." />
        <FaqItem q="¿Cómo funcionan los planes?" a="Gratis 3 facturas. Trial 0,50€ 24h (hasta 5) y pasa a Premium si no cancelas. Premium 39,90€ (15 facturas). Enterprise 79,90€ ilimitadas." />
        <FaqItem q="¿Puedo cancelar?" a="Sí, desde Cuenta › Desuscribirse." />
      </div>
      <div>
        <h4 className="text-lg font-semibold text-slate-900 mb-3">Tu suscripción</h4>
        <p className="text-sm text-slate-700 mb-4">Estado actual: <span className="font-medium uppercase">{plan.name}</span> {plan.max ? `(${plan.max} máx.)` : "(ilimitadas)"}</p>
        <div className="grid gap-4 lg:grid-cols-4">
          <PlanCard title="Free" price="0€" desc="3 facturas" action={() => setPlan({ name: "free", remaining: 3, max: 3 })} />
          <PlanCard title="Trial" price="0,50€" desc="24h · hasta 5" note="Pasa a Premium si no cancelas" action={() => setPlan({ name: "trial", remaining: 5, max: 5, renewsTo: "premium" })} />
          <PlanCard title="Premium" price="39,90€" desc="15 facturas" action={() => setPlan({ name: "premium", remaining: 15, max: 15 })} />
          <PlanCard title="Enterprise" price="79,90€" desc="Ilimitadas" note="Contratación explícita" action={() => setPlan({ name: "enterprise", remaining: Infinity, max: null })} />
        </div>
        <p className="mt-3 text-xs text-slate-600">Si contratas Trial y no cancelas en 24h, pasarás a Premium automáticamente. Enterprise requiere contratación expresa.</p>
      </div>
    </CardBody>
  );
}
const PlanCard = ({ title, price, desc, note, action }: any) => (<Card><CardBody><p className="text-sm text-slate-500">{title}</p><p className="text-2xl font-bold text-slate-900">{price}</p><p className="text-sm text-slate-600">{desc}</p>{note && <p className="mt-1 text-xs text-slate-500">{note}</p>}<Button className="mt-3 w-full" onClick={action}>Seleccionar</Button></CardBody></Card>);
function AccountSection({ auth }: any) {
  const data = auth.getUserData();
  const unsubscribe = () => { if (!confirm("¿Desuscribirte del plan actual?")) return; auth.setUserData((d: any) => ({ ...d, plan: { name: "free", remaining: 3, max: 3 } })); alert("Suscripción cancelada. Has vuelto al plan Free."); };
  const deleteAccount = () => { if (!confirm("Si eliminas la cuenta se eliminarán todas tus facturas. ¿Confirmas?")) return; const s = getStore(); delete s.users[auth.user.email]; delete s.currentUser; setStore(s); location.reload(); };
  return (<CardBody className="space-y-4">
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4"><div><p className="text-sm font-semibold text-slate-900">Plan actual</p><p className="text-sm text-slate-600 uppercase">{data?.plan?.name}</p></div><Button variant="outline" onClick={unsubscribe}>Desuscribirse</Button></div>
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4"><p className="text-sm font-semibold text-rose-900">Eliminar cuenta</p><p className="text-xs text-rose-800">Si eliminas tu cuenta se eliminarán todas las facturas.</p><Button className="mt-3" variant="danger" onClick={deleteAccount}>Eliminar cuenta</Button></div>
  </CardBody>);
}

/* ---------- Preview & Download helpers ---------- */
function InvoicePreviewModal({ open, onClose, invoice }: any) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const htmlDoc = () => `<!doctype html><html><head><meta charset='utf-8'><title>Factura ${invoice?.number}</title><style>${PRINT_STYLES}</style></head><body>${areaRef.current?.innerHTML || ""}</body></html>`;
  const download = () => { const blob = new Blob([htmlDoc()], { type: "text/html;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `factura-${invoice.number}.html`; document.body.appendChild(a); a.click(); a.remove(); };
  const toPDF = () => { const w = window.open("", "_blank"); if (!w) return; w.document.write(htmlDoc()); w.document.close(); w.focus(); setTimeout(() => w.print(), 300); };
  if (!open || !invoice) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Factura #${invoice.number}`} wide>
      <div className="flex items-center justify-end gap-2 pb-3"><Button variant="secondary" onClick={download}>Descargar HTML</Button><Button onClick={toPDF}>Exportar PDF</Button></div>
      <div ref={areaRef}><InvoiceDocByTemplate invoice={invoice} accentColor={invoice.color} templateId={invoice.templateId} /></div>
    </Modal>
  );
}
const downloadHTML = (inv: any) => { const html = `<!doctype html><html><head><meta charset='utf-8'><title>Factura ${inv?.number}</title><style>${PRINT_STYLES}</style></head><body>${document.querySelector("#hidden-print") ? (document.querySelector("#hidden-print") as HTMLElement).innerHTML : ""}</body></html>`; const blob = new Blob([html], { type: "text/html;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `factura-${inv.number}.html`; document.body.appendChild(a); a.click(); a.remove(); };
const exportPDF = (inv: any) => { const w = window.open("", "_blank"); if (!w) return; const html = `<!doctype html><html><head><meta charset='utf-8'><title>Factura ${inv?.number}</title><style>${PRINT_STYLES}</style></head><body><div>${document.querySelector("#hidden-print") ? (document.querySelector("#hidden-print") as HTMLElement).innerHTML : ""}</div></body></html>`; w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 300); };
const PRINT_STYLES = `@page{size:A4;margin:24mm}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#0f172a}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{text-align:left;padding:8px;border-bottom:1px solid #e2e8f0}`;

/* ---------- App (routes & modals) ---------- */
export default function App() {
  const auth = useAuth();
  const [route, setRoute] = useState("home");
  const [contactOpen, setContactOpen] = useState(false);
  const [templateModal, setTemplateModal] = useState<any>(null);
  const [pickedTemplate, setPickedTemplate] = useState<any>(null);
  const [builderInvoice, setBuilderInvoice] = useState<any>(null);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [successModal, setSuccessModal] = useState<any>(null);

  useEffect(() => { if (auth.user && route === "home") setRoute("dashboard"); }, [auth.user]);

  const handleTemplatePick = (t: any) => { setPickedTemplate(t); setRoute("builder"); };
  const pushInvoice = (auth: any, invoice: any) => { const s = getStore(); const ud = s.users?.[auth.user.email]; const newInv = { ...invoice, id: invoice.id || uid() }; const next = [newInv, ...(ud?.invoices || [])]; s.users[auth.user.email].invoices = next; const plan = s.users[auth.user.email].plan || { name: "free", remaining: 3, max: 3 }; if (plan.name !== "enterprise" && plan.remaining !== Infinity && plan.remaining > 0) plan.remaining -= 1; setStore(s); };
  const handleProceedDownload = (invoice: any) => { if (!auth.user) { setBuilderInvoice(invoice); setAuthGateOpen(true); return; } pushInvoice(auth, invoice); setSuccessModal(invoice); };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header onGoto={setRoute} user={auth.user} onOpenContact={() => setContactOpen(true)} />
      {route === "home" && <Home onGoto={setRoute} />}
      {route === "templates" && <Templates onPick={handleTemplatePick} onPreviewTemplate={(t: any) => setTemplateModal(t)} />}
      {route === "builder" && <Builder template={pickedTemplate || TEMPLATES[0]} initial={builderInvoice} onBack={() => setRoute("templates")} onProceed={(inv: any) => handleProceedDownload({ ...inv, id: inv.id || uid() })} auth={auth} />}
      {route === "login" && <AuthScreen mode="login" onSubmit={(e: string, p: string) => auth.login(e, p)} switchTo={() => setRoute("signup")} />}
      {route === "signup" && <AuthScreen mode="signup" onSubmit={(e: string, p: string) => auth.signup(e, p)} switchTo={() => setRoute("login")} />}
      {route === "dashboard" && auth.user && <Dashboard auth={auth} onOpenContact={() => setContactOpen(true)} onGotoBuilder={() => { setPickedTemplate(TEMPLATES[0]); setRoute("builder"); }} onRename={(inv: any) => { const name = prompt("Nuevo número/nombre para la factura", inv.number); if (!name) return; const s = getStore(); const list = s.users[auth.user.email].invoices.map((x: any) => x.id === inv.id ? { ...x, number: name } : x); s.users[auth.user.email].invoices = list; setStore(s); }} />}

      <Footer />

      {/* Template preview modal */}
      <Modal open={Boolean(templateModal)} onClose={() => setTemplateModal(null)} title={`Ejemplo · ${templateModal?.name}`} wide>
        {templateModal && (<div className="space-y-4"><InvoiceDocByTemplate invoice={{ ...DEFAULT_SAMPLE, templateId: templateModal.id, color: templateModal.colors[0] }} accentColor={templateModal.colors[0]} templateId={templateModal.id} /><div className="flex justify-end"><Button onClick={() => { setPickedTemplate(templateModal); setTemplateModal(null); setRoute("builder"); }}>Usar esta plantilla</Button></div></div>)}
      </Modal>

      {/* Auth gate */}
      <AuthGateModal open={authGateOpen} onClose={() => setAuthGateOpen(false)} onAuthed={(inv: any) => { setAuthGateOpen(false); setRoute("success"); pushInvoice(auth, inv); setSuccessModal(inv); }} auth={auth} nextInvoice={builderInvoice} />

      {/* Success page */}
      <Modal open={Boolean(successModal) && route !== "dashboard"} onClose={() => setSuccessModal(null)} title="¡Felicidades!" wide>
        <p className="text-slate-700">Tu factura está lista para descargar.</p>
        <div className="my-4">{successModal && <InvoiceDocByTemplate invoice={successModal} accentColor={successModal.color} templateId={successModal.templateId} />}</div>
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setSuccessModal(null)}>Cerrar</Button><Button onClick={() => downloadHTML(successModal)}>Descargar HTML</Button><Button onClick={() => exportPDF(successModal)}>Exportar PDF</Button></div>
      </Modal>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />

      <div id="hidden-print" className="hidden" />
    </div>
  );
}

/* ---------- Auth screen ---------- */
function AuthScreen({ mode = "login", onSubmit, switchTo }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (e: any) => { e.preventDefault(); setError(""); try { onSubmit(email, password); } catch (err: any) { setError(err.message || "Error"); } };
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader title={mode === "login" ? "Entrar" : "Crear cuenta"} subtitle="Correo y contraseña" />
          <CardBody>
            <form onSubmit={submit} className="space-y-3">
              <div><label className="text-xs font-medium text-slate-600">Correo</label><Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required /></div>
              <div><label className="text-xs font-medium text-slate-600">Contraseña</label><Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required /></div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button className="w-full" type="submit">{mode === "login" ? "Entrar" : "Crear cuenta"}</Button>
            </form>
            <div className="mt-4 flex items-center justify-between gap-2">
              <button className="text-sm text-slate-700 underline" onClick={switchTo}>{mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}</button>
              <Button variant="outline">Continuar con Google</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}

/* ---------- Contact Modal & Footer ---------- */
function ContactModal({ open, onClose }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const submit = (e: any) => { e.preventDefault(); setSent(true); setTimeout(() => onClose(), 900); };
  return (
    <Modal open={open} onClose={onClose} title="Contacto">
      {sent ? (
        <div className="grid place-items-center p-10 text-center">
          <div className="mb-2 h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
          </div>
          <p className="text-slate-800">¡Mensaje enviado! Te responderemos pronto.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-600">Nombre</label><Input value={name} onChange={(e: any) => setName(e.target.value)} required /></div>
            <div><label className="text-xs font-medium text-slate-600">Correo</label><Input type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required /></div>
          </div>
          <div><label className="text-xs font-medium text-slate-600">Mensaje</label><Textarea rows={5} value={msg} onChange={(e: any) => setMsg(e.target.value)} required placeholder="Cuéntanos en qué podemos ayudarte" /></div>
          <div className="flex justify-end gap-2"><Button variant="secondary" type="button" onClick={onClose}>Cerrar</Button><Button type="submit">Enviar</Button></div>
        </form>
      )}
    </Modal>
  );
}
function Footer() {
  return (
    <footer className="border-t border-slate-200 py-10">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Facturakit" className="h-6 w-6 rounded" />
            <p className="text-sm text-slate-600">© {new Date().getFullYear()} Facturakit. Todos los derechos reservados.</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a className="text-slate-600 hover:text-slate-900" href="#">Términos</a>
            <a className="text-slate-600 hover:text-slate-900" href="#">Privacidad</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
function FaqItem({ q, a }: any) { const [open, setOpen] = useState(false); return (<div className="rounded-xl border border-slate-200"><button className="flex w-full items-center justify-between p-4 text-left" onClick={() => setOpen(!open)}><span className="font-medium text-slate-900">{q}</span><svg className={`h-5 w-5 text-slate-600 transition ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z" /></svg></button>{open && <div className="border-t border-slate-200 p-4 text-slate-700">{a}</div>}</div>); }

