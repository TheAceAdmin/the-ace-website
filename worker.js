export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Default to index.html for root
    if (pathname === '/' || pathname === '/index.html' || pathname === '') {
      pathname = '/index.html';
    }

    // Get the file from the site bucket
    try {
      const file = await env.ASSETS.fetch(new URL(pathname, request.url));
      
      // If file not found, try index.html
      if (file.status === 404 && pathname !== '/index.html') {
        return env.ASSETS.fetch(new URL('/index.html', request.url));
      }
      
      return file;
    } catch (e) {
      // Fallback to index.html
      return env.ASSETS.fetch(new URL('/index.html', request.url));
    }
  }
};

