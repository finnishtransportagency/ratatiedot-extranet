#!/bin/bash
set -e
cd /usr/share/nginx/html
npm install
npm run build
