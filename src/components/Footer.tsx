export default function Footer() {
  const footerLinks = [
    {
      label: "Product",
      links: ["Features", "Pricing", "Mobile App", "Web Dashboard"],
    },
    {
      label: "Company",
      links: ["About", "Blog", "Careers", "Press"],
    },
    {
      label: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
    },
  ];

  return (
    <footer className="bg-[#23130f] text-white py-16 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-[#ff5833] rounded flex items-center justify-center border-2 border-white">
              <span className="material-symbols-outlined text-white text-sm font-bold">
                celebration
              </span>
            </div>
            <span className="text-2xl font-extrabold tracking-tighter uppercase italic">
              GalaUs
            </span>
          </div>
          <p className="text-slate-400 font-medium">
            The social planning platform that makes getting together actually
            fun.
          </p>
        </div>
        {footerLinks.map((col) => (
          <div key={col.label}>
            <h4 className="text-sm font-black mb-6 uppercase tracking-widest text-[#ff5833]">
              {col.label}
            </h4>
            <ul className="flex flex-col gap-3 text-slate-400 font-bold text-sm">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-slate-500 text-sm font-medium text-center">
        © {new Date().getFullYear()} GalaUs. All rights reserved.
      </div>
    </footer>
  );
}
