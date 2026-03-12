export default function Footer() {
  const footerLinks = [
    {
      label: "Contact",
      links: [
        { text: "Email", href: "mailto:markeron5@gmail.com" },
        { text: "Github", href: "https://github.com/Eewonn/gala-us" },
        { text: "LinkedIn", href: "https://linkedin.com/in/mark-eron-diaz" },
      ],
    },
    {
      label: "Legal",
      links: [
        { text: "Privacy Policy", href: "/privacy" },
        { text: "Terms of Service", href: "/terms" },
        { text: "Cookie Policy", href: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="bg-[#23130f] dark:bg-[#1a0a07] text-white py-16 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
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
                <li key={l.text}>
                  <a 
                    href={l.href} 
                    className="hover:text-white transition-colors"
                    target={l.href.startsWith('http') ? '_blank' : undefined}
                    rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {l.text}
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
