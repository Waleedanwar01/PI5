export default async function TestQuotes({ searchParams }) {
  const zip = searchParams?.zip || '';
  
  // Test direct API call
  const url = `/api/quotes?zip=${zip}`;
  console.log('Fetching from URL:', url);
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    console.log('Response status:', res.status);
    const json = await res.json();
    console.log('Response JSON:', json);
    console.log('Companies:', json.companies);
    console.log('Companies length:', json.companies?.length || 0);
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug: ZIP {zip}</h1>
        <div className="bg-gray-100 p-4 rounded">
          <p>URL: {url}</p>
          <p>Status: {res.status}</p>
          <p>OK: {json.ok ? 'true' : 'false'}</p>
          <p>Companies count: {json.companies?.length || 0}</p>
          <pre className="text-xs overflow-auto">{JSON.stringify(json, null, 2)}</pre>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <div className="bg-red-100 p-4 rounded">
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }
}