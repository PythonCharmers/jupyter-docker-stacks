#!/bin/bash

# start redis
/etc/init.d/redis-server start

# Check if the current user is root, and if so, switch to jovyan
if [ "$(whoami)" = "root" ]; then
    su jovyan -c "$0 $*"
    exit $?
fi

export PATH="/opt/conda/bin:$PATH"

#whoami > /tmp/_whoami

# write proxy config (for jupyter-server-proxy extension)
# Corrected variable names
JUPYTER_CONFIG_DIR="/home/jovyan/.jupyter"
JUPYTER_CONFIG_FILE="$JUPYTER_CONFIG_DIR/jupyter_notebook_config.py"

# Create the directory if it doesn't exist
if [ ! -d "$JUPYTER_CONFIG_DIR" ]; then
    mkdir -p "$JUPYTER_CONFIG_DIR"
fi

# Write the configuration to the file
cat << EOF > "$JUPYTER_CONFIG_FILE"
c.ServerProxy.servers = {
    'vscode-server': {
        'port': 14850,
        'absolute_url': False,
        'launcher_entry': {
            'title': 'VSCode Server',
            'path': '/vscode-server'
        }
    }
}
EOF

echo "jupyter-server-proxy сonfiguration written to $JUPYTER_CONFIG_FILE"

# Start code-server in the background
code-server --bind-addr localhost:14850 --auth none &

# Install the MS Python extension
code-server --install-extension ms-python.python --force

# activate env vars in order to make jupyterlab work properly
source /tmp/_env_vars.sh

# start jupyterlab
/opt/conda/bin/python3.11 /opt/conda/bin/jupyterhub-singleuser --ip=0.0.0.0

# Do we need this line below? :)
python -c "while True: import time; time.sleep(60)"
