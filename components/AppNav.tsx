const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      href: "/products",
      label: "Products",
    },
    {
      href: "/customers",
      label: "Customers",
    },
    {
      href: "/sales/new",
      label: "New Sale",
    },
  ];
  
  export default function AppNav() {
    return (
      <nav className="mt-6 flex flex-wrap gap-3">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            {link.label}
          </a>
        ))}
      </nav>
    );
  }