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
    label: "Reports",
    href: "/reports",
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
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}