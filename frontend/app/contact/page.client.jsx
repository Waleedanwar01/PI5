"use client";
import { useEffect, useState } from 'react';
import SmartLink from '../components/SmartLink.jsx';

export const metadata = {
  title: 'Contact Us',
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ ok: false, error: '', sent: false });
  const [loading, setLoading] = useState(false);
  const [cfg, setCfg] = useState({ brand_name: 'Car Insurance Comparison', email: '', phone_number: '(800) 308-0987', company_address: '' });

  useEffect(() => {
    fetch('/api/site-config/', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setCfg({
          brand_name: data.brand_name || 'Car Insurance Comparison',
          email: data.email || '',
          phone_number: data.phone_number || '(800) 308-0987',
          company_address: data.company_address || '',
        });
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ ok: false, error: '', sent: false });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStatus({ ok: true, error: '', sent: true });
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus({ ok: false, error: json.error || 'Submission failed', sent: false });
      }
    } catch (err) {
      setStatus({ ok: false, error: 'Network error', sent: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.06), transparent 40%)'}}></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">Contact {cfg.brand_name}</h1>
          <p className="mt-4 max-w-3xl text-sm sm:text-base md:text-lg text-gray-300">
            We are not an insurance company or an insurance agency but rather an independent consumer information website offering insurance quote comparisons.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <SmartLink href={`tel:${(cfg.phone_number || '').replace(/\s+/g,'')}`} className="inline-flex items-center rounded-md bg-orange-700 hover:bg-orange-800 text-white px-5 py-2.5 font-semibold shadow-sm">Call {cfg.phone_number}</SmartLink>
            <SmartLink href={cfg.email ? `mailto:${cfg.email}` : '#contact-form'} className="inline-flex items-center rounded-md border border-gray-600 text-white hover:border-white hover:bg-white/10 px-5 py-2.5 font-semibold">Email Us</SmartLink>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-600">
        <SmartLink href="/" className="hover:text-gray-900">Home</SmartLink>
        <span className="mx-2">/</span>
        <span>Contact Us</span>
      </nav>

      {/* Content + Form */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900">Who We Are</h2>
              <p className="mt-2 text-gray-700">
                We are not an insurance company or an insurance agency but rather an independent consumer information website offering insurance quote comparisons.
              </p>
              <div className="mt-6 space-y-4 text-gray-700">
                <div>
                  <p className="font-semibold">By Mail:</p>
                  <p>{cfg.company_address || '7901 4th St. N #19799 St. Petersburg, FL 33702'}</p>
                </div>
                <div>
                  <p className="font-semibold">Speak to a Live Agent And Get Insurance Quotes:</p>
                  <p>
                    Call <SmartLink href={`tel:${(cfg.phone_number || '').replace(/\s+/g,'')}`} className="text-blue-600 hover:underline">{cfg.phone_number}</SmartLink>
                  </p>
                </div>
                {cfg.email ? (
                  <div>
                    <p className="font-semibold">Support Email:</p>
        <p><SmartLink href={`mailto:${cfg.email}`} className="text-blue-600 hover:underline">{cfg.email}</SmartLink></p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900">Reach Us Via Email</h2>
              <p className="mt-2 text-gray-700">Use the contact form below to reach website support or request an insurance expert as a source.</p>
              <form id="contact-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Your Name (required)</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Your Email (required)</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input type="text" name="subject" value={form.subject} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Your Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:outline-none"></textarea>
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50">{loading ? 'Sending...' : 'Send Message'}</button>
                  {status.sent && <span className="text-green-700 text-sm">Thank you! Your message has been sent.</span>}
                  {status.error && <span className="text-red-600 text-sm">{status.error}</span>}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-200 pt-6">
          {[
            { label: 'About', href: '/about' },
            { label: 'Careers', href: '/careers' },
            { label: 'Editorial Guidelines', href: '/editorial-guidelines' },
            { label: 'Advertiser Disclosure', href: '/advertiser-disclosure' },
            { label: 'Contact Us', href: '/contact' },
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Terms & Conditions', href: '/terms' },
            { label: 'CCPA', href: '/ccpa' },
          ].map((l) => (
            <SmartLink key={l.label} href={l.href} className="text-gray-700 text-sm hover:text-gray-900">
              {l.label}
            </SmartLink>
          ))}
        </div>
      </section>
    </div>
  );
}
