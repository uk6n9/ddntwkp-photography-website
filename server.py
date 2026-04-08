import os, http.server, socketserver

os.chdir('/Users/gt3rs/Desktop/WebSitePhoto')

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({'.js': 'application/javascript', '.css': 'text/css'})

with socketserver.TCPServer(('', PORT), Handler) as httpd:
    httpd.serve_forever()
