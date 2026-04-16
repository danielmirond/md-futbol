export function Footer() {
  return (
    <footer className="mt-16 bg-md-black text-white">
      <div className="md-bar" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="font-display font-bold text-2xl uppercase mb-2">
              MD <span className="text-md">Fútbol</span>
            </div>
            <p className="font-sans text-sm text-white/60">
              Datos en directo. Todas las competiciones. Powered by SportMonks.
            </p>
          </div>
          <div className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
            © {new Date().getFullYear()} · Proyecto independiente
          </div>
        </div>
      </div>
    </footer>
  )
}
