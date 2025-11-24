export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Redirect first-level paths (other than root and existing /pages/*) to /pages/<segment>
    if (pathname !== '/' && !pathname.startsWith('/pages/')) {
      const segment = pathname.split('/')[1];
      const hasNestedSegment = pathname.slice(1).includes('/');

      if (segment && !hasNestedSegment) {
        const redirectUrl = new URL(url);
        redirectUrl.pathname = `/pages/${segment}`;
        return Response.redirect(redirectUrl.toString(), 301);
      }
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

