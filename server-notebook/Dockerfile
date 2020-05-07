# Build of jupyter/scipy-notebook from before jupyterlab was bumped up to v2
FROM jupyter/scipy-notebook:e255f1aa00b2

USER $NB_UID

COPY requirements.txt /home/$NB_UID/requirements.txt

RUN pip install --no-cache-dir -r /home/$NB_UID/requirements.txt
RUN pip install --no-cache-dir nbgitpuller

# Relies on jupyter_contrib_nbextensions installation
RUN jupyter contrib nbextension install --user
RUN jupyter nbextension enable varInspector/main

## Setting up supervisor

RUN pip install --no-cache-dir supervisor

USER root

RUN mkdir /etc/supervisor
RUN mkdir /etc/supervisor/conf.d

COPY supervisord.conf /etc/supervisor/supervisord.conf
# RUN echo_supervisord_conf > /etc/supervisord.conf