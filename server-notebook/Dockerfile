# Build of jupyter/scipy-notebook from before jupyterlab was bumped up to v2
FROM jupyter/scipy-notebook:e255f1aa00b2
# FROM pythoncharmers/scipy-notebook:latest

USER $NB_UID

COPY requirements.txt /home/$NB_UID/requirements.txt

RUN pip install --no-cache-dir -r /home/$NB_UID/requirements.txt
RUN pip install --no-cache-dir nbgitpuller

# Relies on jupyter_contrib_nbextensions installation
RUN jupyter contrib nbextension install --user
RUN jupyter nbextension enable varInspector/main

## Setting up supervisor and watchmedo

RUN pip install --no-cache-dir supervisor
RUN pip install --no-cache-dir watchdog[watchmedo]

USER root

# Folders for config and log files
RUN mkdir /etc/supervisor
RUN mkdir /etc/supervisor/conf.d
RUN mkdir /var/log/supervisor
RUN mkdir /var/log/jupyter

COPY supervisord.conf /etc/supervisor/supervisord.conf
# RUN echo_supervisord_conf > /etc/supervisord.conf
COPY watchmedo.conf  /etc/supervisor/conf.d/watchmedo.conf
COPY .watchdog_tricks.yml /home/$NB_USER/.watchdog_tricks.yml

# New command for when container is executed
# Overwrites CMD entry from base-notebook - only one CMD entry per container
# Purpose is to include supervisord at start of image
CMD ["jupyter_supervisor_start.sh"]
