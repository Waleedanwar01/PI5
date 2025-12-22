"use client";

import React from 'react';
import Link from 'next/link';
import SmartImage from './SmartImage';

export default function TeamGrid({ members }) {
  if (!members || members.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Meet the Experts</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                Our team is dedicated to bringing you the best insurance comparisons and advice.
            </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member) => (
            <div 
              key={member.id} 
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
                 <Link href={`/team-member/${member.slug}`} className="block w-full h-full">
                    {member.image ? (
                      <SmartImage
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    )}
                 </Link>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col text-center">
                <Link href={`/team-member/${member.slug}`} className="block">
                  <h3 className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors mb-1">
                    {member.name}
                  </h3>
                </Link>
                
                <div className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wider">
                  {member.role}
                </div>
                
                {/* Social Icons Row */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  {member.linkedin_url && member.linkedin_url.trim() && member.linkedin_url !== '#' && member.linkedin_url !== 'null' && member.linkedin_url !== 'undefined' && (
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-colors">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  )}
                  {member.facebook_url && member.facebook_url.trim() && member.facebook_url !== '#' && member.facebook_url !== 'null' && member.facebook_url !== 'undefined' && (
                    <a href={member.facebook_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors">
                      <span className="sr-only">Facebook</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.641c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z"/></svg>
                    </a>
                  )}
                  {member.twitter_url && member.twitter_url.trim() && member.twitter_url !== '#' && member.twitter_url !== 'null' && member.twitter_url !== 'undefined' && (
                    <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1DA1F2] transition-colors">
                      <span className="sr-only">Twitter</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                    </a>
                  )}
                  {member.email && member.email.trim() && member.email !== '#' && member.email !== 'null' && member.email !== 'undefined' && (
                    <a href={`mailto:${member.email}`} className="text-slate-400 hover:text-slate-900 transition-colors">
                      <span className="sr-only">Email</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
