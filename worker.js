export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Define redirects (200 = rewrite, URL stays the same)
    const redirects = {
      '/maintenance-calculator.html': '/pages/maintenance-calculator.html',
      '/property-tax-lookup.html': '/pages/property-tax-lookup.html',
      '/membership-form.html': '/pages/membership-form.html',
      '/tenant-form.html': '/pages/tenant-form.html',
      '/business-opportunities.html': '/pages/business-opportunities.html',
      '/stall-terms-and-conditions.html': '/pages/stall-terms-and-conditions.html',
    };

    // Apply redirect if exists
    if (redirects[pathname]) {
      pathname = redirects[pathname];
    }

    // Default to index.html for root
    if (pathname === '/') {
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

