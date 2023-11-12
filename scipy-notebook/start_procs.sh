#!/bin/bash

VSCODE_PASSWORD="A038Sdj49889SDjka9SdkhaZ"

# Start code-server in the background
sudo -u jovyan -H sh -c "export PASSWORD='$VSCODE_PASSWORD' && code-server --bind-addr localhost:14850 --auth password &"

# Install the MS Python extension
sudo -u jovyan -H sh -c "code-server --install-extension ms-python.python --force"

# [re]estart Nginx to apply previously made changes
/etc/init.d/nginx restart

# unpack and install the extension
cd /opt/conda/share/jupyter/lab/extensions/ && tar xf open_in_vscode.tar
rm /opt/conda/share/jupyter/lab/extensions/open_in_vscode.tar
chmod 777 -R /opt/conda/share/jupyter/lab/extensions/open_in_vscode
cp /opt/conda/share/jupyter/lab/extensions/open_in_vscode/open_in_vscode/vs_code_opener.py /usr/local/bin
chmod +x /usr/local/bin/vs_code_opener.py
sudo -u jovyan -H sh -c 'export PATH="/opt/conda/bin:$PATH" && cd /opt/conda/share/jupyter/lab/extensions/open_in_vscode && pip install -e . && jupyter lab build && jupyter server extension enable open_in_vscode'

# Export PATH and start Jupyter notebook
sudo -u jovyan -H sh -c 'export PATH="/opt/conda/bin:$PATH" && start-notebook.sh /home/jovyan'

# replace with jupyterlab start-up script?
python -c "while True: import time; time.sleep(60)"
