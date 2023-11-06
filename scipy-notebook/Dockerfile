# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

# Don't forget to keep the dockerhub image updated
ARG BASE_CONTAINER=pythoncharmers/minimal-notebook:latest
FROM $BASE_CONTAINER

USER root

# ffmpeg for matplotlib anim & dvipng for latex labels
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg dvipng && \
    rm -rf /var/lib/apt/lists/*

USER $NB_UID

COPY requirements.txt /home/$NB_UID/requirements.txt
COPY requirements_pip.txt /home/$NB_UID/requirements_pip.txt

# Install Python 3 packages
# RUN pip install -r /home/$NB_UID/requirements.txt
RUN conda install --quiet --yes \
    --file /home/$NB_UID/requirements.txt

# Install the compatible jupyter_bokeh version
RUN pip install -r /home/$NB_UID/requirements_pip.txt

RUN conda clean --all -f -y && \
    jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build && \
    jupyter lab build -y && \
    jupyter lab clean -y && \
    npm cache clean --force && \
    rm -rf /home/$NB_USER/.cache/yarn && \
    rm -rf /home/$NB_USER/.node-gyp && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

# Not necessary for us, and probably not worth the hassle

# Install facets which does not have a pip or conda package at the moment
# RUN cd /tmp && \
#     git clone https://github.com/PAIR-code/facets.git && \
#     cd facets && \
#     jupyter nbextension install facets-dist/ --sys-prefix && \
#     cd && \
#     rm -rf /tmp/facets && \
#     fix-permissions $CONDA_DIR && \
#     fix-permissions /home/$NB_USER

# Import matplotlib the first time to build the font cache.
ENV XDG_CACHE_HOME /home/$NB_USER/.cache/
RUN MPLBACKEND=Agg python -c "import matplotlib.pyplot" && \
    fix-permissions /home/$NB_USER

USER $NB_UID
