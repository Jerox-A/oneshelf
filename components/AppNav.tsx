const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Products",
    href: "/products",
  },
  {
    label: "Customers",
    href: "/customers",
  },
  {
    label: "Sales",
    href: "/sales",
  },
  {
    label: "New Sale",
    href: "/sales/new",
  },
];

export default function AppNav() {
  return (
    <nav className="mt-6 flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}