#!/bin/bash

# Dump all environment variables to a shell script with proper escaping
printenv | while IFS='=' read -r name value; do
    printf 'export %s=%q\n' "$name" "$value"
done > /tmp/_env_vars.sh
chmod +x /tmp/_env_vars.sh
