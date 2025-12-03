import SmartLink from './SmartLink.jsx';

export default function HelpfulLinks({ links = [], title = "Helpful Links", attachToFooter = false }) {
  const safeLinks = Array.isArray(links) ? links.filter((l) => !!(l?.page_slug || l?.name)) : [];
  if (safeLinks.length === 0) return null;
  const sectionClasses = attachToFooter
    ? "mt-10 mb-10 w-full border-t border-gray-200 pt-8"
    : "mt-12 w-full";
  return (
    <section className={sectionClasses} aria-labelledby="helpful-links-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 id="helpful-links-heading" className="text-xl md:text-2xl font-semibold text-orange-700">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {safeLinks.map((l, idx) => {
            const href = `/${encodeURIComponent(String(l.page_slug || ''))}`;
            const label = String(l.name || l.page_slug || `Link ${idx + 1}`);
            return (
              <SmartLink
                key={`${String(l.page_slug || label || '')}-${idx}`}
                href={href}
                className="group h-full rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-orange-700"
              >
                <div className="flex items-start justify-between">
                  <span className="text-gray-900 text-sm md:text-base font-medium">{label}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M13.5 4.5l6 6-6 6m6-6H4.5" />
                  </svg>
                </div>
                <p className="mt-1 text-xs md:text-sm text-gray-600">Explore more details</p>
              </SmartLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}