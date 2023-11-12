#!/bin/bash

# Configure Nginx as a reverse proxy
echo "Configuring Nginx..."
cat << EOF | sudo tee /etc/nginx/sites-available/code-server
server {
    listen 14853;
    listen [::]:14853;

    server_name _;

    location / {
        proxy_pass http://localhost:14850;
        proxy_set_header Host \$http_host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;
    }
}
EOF

# Enable the configuration
sudo ln -s /etc/nginx/sites-available/code-server /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

