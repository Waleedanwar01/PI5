import React from 'react';
import TeamMemberClient from '../../components/TeamMemberClient.jsx';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
    
    // Fetch Brand Name
    let brandName = 'Car Insurance Comparison';
    try {
        const scRes = await fetch(`${base}/api/site-config/`, { cache: 'no-store' });
        if (scRes.ok) {
             const sc = await scRes.json();
             if (sc.brand_name) brandName = sc.brand_name.trim();
        }
    } catch (e) {
        console.error('Error fetching site config:', e);
    }

    const url = `${base}/api/team-member/${encodeURIComponent(String(slug || '').trim())}/`;
    const response = await fetch(url, { cache: 'no-store' });
    
    if (response.ok) {
      const data = await response.json();
      const member = data?.team_member;
      if (member && member.name) {
        return { 
          title: member.meta_title || `${member.name} - ${member.role} | ${brandName}`, 
          description: member.meta_description || `Learn more about ${member.name}, ${member.role} at ${brandName}.` 
        };
      }
    }
  } catch (error) {
    console.error('Error fetching team member metadata:', error);
  }
  
  return { 
    title: 'Team Member', 
    description: '' 
  };
}

export default async function TeamMemberPage({ params }) {
  const { slug } = await params;
  return <TeamMemberClient slug={slug} />;
}
