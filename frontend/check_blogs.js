
async function checkBlogs() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/blogs/?limit=6');
    if (res.ok) {
      const data = await res.json();
      console.log('Blogs found:', data.blogs?.length || 0);
      if (data.blogs?.length > 0) {
        console.log('First blog:', data.blogs[0].title);
      }
    } else {
      console.log('Error fetching blogs:', res.status);
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

checkBlogs();
