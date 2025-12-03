import React from 'react';
import PageClient from '../components/PageClient.jsx';

export async function generateMetadata({ params }) {
  const slug = String(params?.slug || 'Page').trim();
  return { title: slug, description: '' };
}

export default function Page({ params }) {
  const slug = String(params?.slug || '').trim();
  return <PageClient slug={slug} />;
}