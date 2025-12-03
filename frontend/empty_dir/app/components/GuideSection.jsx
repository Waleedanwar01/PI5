import React from "react";

const steps = [
  { title: "Share details", desc: "Tell us what you need covered." },
  { title: "Compare options", desc: "We’ll help you review plans." },
  { title: "Get covered", desc: "Choose confidently and proceed." },
];

export default function GuideSection() {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-900">Guide</h2>
        <p className="mt-2 text-gray-700">A simple way to get started.</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-gray-700">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}