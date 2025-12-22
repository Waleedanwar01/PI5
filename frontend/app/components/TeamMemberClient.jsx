"use client";

import React from 'react';
import Link from 'next/link';
import SmartImage from './SmartImage';
import PageHero from './PageHero';

export default function TeamMemberClient({ slug }) {
  const [member, setMember] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/team-member/${slug}`);
        if (res.ok) {
          const json = await res.json();
          setMember(json.team_member);
        } else {
          setError('Team member not found');
        }
      } catch (e) {
        setError('Error loading team member');
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Team member not found'}</h1>
        <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <>
      <PageHero 
        title={member.name} 
        subtitle={`${member.role} ${member.department ? `• ${member.department}` : ''}`}
        imageUrl={null} 
        variant="dark"
        align="center"
      />
      
      <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3 flex-shrink-0">
              <div className="sticky top-24">
                <div className="aspect-w-3 aspect-h-4 rounded-xl overflow-hidden shadow-lg mb-6 relative h-96 w-full">
                  {member.image ? (
                    <SmartImage
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {member.linkedin_url && member.linkedin_url.trim() && member.linkedin_url.trim() !== '#' && (
                  <a 
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    Connect on LinkedIn
                  </a>
                )}
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Biography</h2>
              <div 
                className="prose prose-lg prose-blue max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: member.description || '<p>No description available.</p>' }}
              />
              
              {member.page_slug && (
                <div className="mt-12 pt-8 border-t">
                  <Link 
                    href={`/${member.page_slug}`}
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800"
                  >
                    &larr; Back to {member.page_title || 'Team'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
