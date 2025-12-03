import React from "react";

export default function WhyChooseUs({ embedUrl }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="mt-2 text-gray-700">Transparent, accurate, and easy to compare.</p>
            <p className="mt-3 text-gray-700">We make shopping for auto insurance simpler. Compare policies, understand coverage, and save money.</p>

            {embedUrl ? (
              <div className="mt-6 aspect-video w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src={embedUrl}
                  title="Embedded Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900">Insurance Guides</h3>
            <p className="mt-2 text-gray-700">Get up to speed quickly.</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">Coverage Basics</h4>
                <p className="mt-1 text-gray-700">Liability vs. comprehensive — learn what each coverage means and why it matters.</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">Rate Factors</h4>
                <p className="mt-1 text-gray-700">Credit, accidents, mileage — understand the key drivers that affect your premium.</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-lg font-semibold text-gray-900">Savings Tips</h4>
                <p className="mt-1 text-gray-700">Bundling, safe driving — find ways to lower your costs without losing protection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}