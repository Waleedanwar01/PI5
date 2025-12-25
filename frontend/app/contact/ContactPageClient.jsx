"use client";
import { useEffect, useState } from 'react';
import SmartLink from '../components/SmartLink.jsx';
import ContactForm from '../components/ContactForm.jsx';
import PageHero from '../components/PageHero.jsx';
import HelpfulLinks from '../components/HelpfulLinks.jsx';

export default function ContactPageClient() {
  const [cfg, setCfg] = useState({ 
    brand_name: 'Car Insurance Comparison', 
    email: '', 
    phone_number: '(800) 308-0987', 
    company_address: '',
    footer_menu: { company: [], legal: [] }
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/site-config/', { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
      fetch('/api/menu/footer/', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ company: [], legal: [] }))
    ]).then(([config, footer]) => {
      setCfg({
        brand_name: config.brand_name || 'Car Insurance Comparison',
        email: config.email || '',
        phone_number: config.phone_number || '(800) 308-0987',
        company_address: config.company_address || '',
        footer_menu: footer
      });
    });
  }, []);

  const helpfulLinks = [
    ...(Array.isArray(cfg.footer_menu?.company) ? cfg.footer_menu.company : []),
    ...(Array.isArray(cfg.footer_menu?.legal) ? cfg.footer_menu.legal : [])
  ];

  return (
    <div>
      {/* Hero Section */}
      <PageHero 
        title={`Contact ${cfg.brand_name}`}
        subtitle="We are not an insurance company or an insurance agency but rather an independent consumer information website offering insurance quote comparisons."
        imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
        variant="dark"
        align="left"
      />

      {/* Content + Form */}
      <section className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 pb-16 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Info Card */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-none shadow-sm border border-slate-200 p-8 h-full">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide mb-6">Who We Are</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                We are not an insurance company or an insurance agency but rather an independent consumer information website offering insurance quote comparisons.
              </p>
              
              <div className="space-y-8">
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">By Mail</p>
                      <p className="text-slate-600">{cfg.company_address || ''}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Speak to a Live Agent</p>
                      <p>
                        <SmartLink href={`tel:${(cfg.phone_number || '').replace(/\s+/g,'')}`} className="text-blue-600 hover:text-blue-700 font-bold text-lg block transition-colors">
                          {cfg.phone_number}
                        </SmartLink>
                      </p>
                    </div>
                  </div>
                </div>

                {cfg.email && (
                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Support Email</p>
                        <p>
                          <SmartLink href={`mailto:${cfg.email}`} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                            {cfg.email}
                          </SmartLink>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2 order-1 lg:order-2">
             <div id="contact-form">
               <ContactForm />
             </div>
          </div>
        </div>


        {/* Helpful Links */}
        <HelpfulLinks links={helpfulLinks} attachToFooter />
      </section>
    </div>
  );
}
