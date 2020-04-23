# Build of jupyter/scipy-notebook from before jupyterlab was bumped up to v2
FROM jupyter/scipy-notebook:e255f1aa00b2

USER $NB_UID

COPY requirements.txt /home/$NB_UID/requirements.txt

RUN pip install -r requirements.txt