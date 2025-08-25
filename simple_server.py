#!/usr/bin/env python3
import os
import sys
import http.server
import socketserver
from urllib.parse import urlparse

class ReactRouter(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        url_parts = urlparse(self.path)
        path = url_parts.path
        
        # If it's a file request (has extension), serve normally
        if '.' in path.split('/')[-1]:
            return super().do_GET()
        
        # For all other paths (routes), serve index.html
        self.path = '/index.html'
        return super().do_GET()

if __name__ == "__main__":
    port = 8001
    
    # Change to frontend/build directory
    build_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'build')
    if os.path.exists(build_dir):
        os.chdir(build_dir)
        print(f"Serving from: {build_dir}")
    else:
        print(f"Build directory not found: {build_dir}")
        sys.exit(1)
    
    with socketserver.TCPServer(("", port), ReactRouter) as httpd:
        print(f"SelfMode server running at http://localhost:{port}")
        print(f"Admin panel: http://localhost:{port}/admin")
        httpd.serve_forever()