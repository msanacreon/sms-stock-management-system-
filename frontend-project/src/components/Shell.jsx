import { Boxes, ClipboardList, LogOut, PackagePlus, ShieldCheck, Warehouse } from 'lucide-react';

const navItems = [
  { key: 'products', label: 'Product', icon: PackagePlus },
  { key: 'warehouses', label: 'Warehouse', icon: Warehouse },
  { key: 'transactions', label: 'Transactions', icon: ClipboardList },
  { key: 'reports', label: 'Reports', icon: Boxes }
];

function Shell({ activePage, onNavigate, onLogout, children, username }) {
  return (
    <div className="min-h-screen bg-[#eef3f1]">
      <div className="mx-auto min-h-screen max-w-[1500px] lg:grid lg:grid-cols-[280px_1fr]">
        <aside className="sticky top-0 hidden h-screen border-r border-[#002f31] bg-brand px-4 py-5 text-white lg:block">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="grid h-11 w-11 place-items-center rounded bg-white/10 ring-1 ring-white/20">
              <Boxes size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-100">StockHub Ltd</p>
              <h1 className="text-lg font-black">SMS Console</h1>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.key;
              return (
                <button
                  className={`flex h-12 w-full items-center gap-3 rounded px-3 text-left text-sm font-bold transition ${
                    active ? 'bg-white text-brand shadow-sm' : 'text-teal-100 hover:bg-white/10 hover:text-white'
                  }`}
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  type="button"
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 rounded-lg border border-white/15 bg-white/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck size={18} />
              Store Manager
            </div>
            <p className="text-sm text-teal-100">{username}</p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 xl:px-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand">StockHub Ltd</p>
                  <h1 className="text-xl font-black text-ink sm:text-2xl">Stock Management System</h1>
                </div>
                <button className="btn-secondary" onClick={onLogout} type="button">
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
              <nav className="flex gap-2 overflow-x-auto lg:hidden">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.key;
                  return (
                    <button
                      className={`inline-flex h-10 min-w-fit items-center gap-2 rounded px-3 text-sm font-bold transition ${
                        active ? 'bg-brand text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      key={item.key}
                      onClick={() => onNavigate(item.key)}
                      type="button"
                    >
                      <Icon size={17} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </header>
          <main className="px-4 py-6 sm:px-6 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default Shell;
