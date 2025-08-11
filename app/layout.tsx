import "./globals.css";
export const metadata = {
  title: "Facturakit · V7.3",
  description: "Crea facturas profesionales en minutos · PDF y HTML",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-slate-900">{children}</body>
    </html>
  );
}
