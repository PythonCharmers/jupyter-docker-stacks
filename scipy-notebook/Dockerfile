# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.
ARG BASE_CONTAINER=jupyter/minimal-notebook
FROM $BASE_CONTAINER

LABEL maintainer="Jupyter Project <jupyter@googlegroups.com>"

USER root

# ffmpeg for matplotlib anim & dvipng for latex labels
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg dvipng && \
    rm -rf /var/lib/apt/lists/*

USER $NB_UID
COPY requirements.txt /home/$NB_UID/requirements.txt

# Install Python 3 packages
# RUN pip install -r /home/$NB_UID/requirements.txt
RUN conda install --quiet --yes \
    --file /home/$NB_UID/requirements.txt \
    && \
    conda clean --all -f -y && \
    # Activate ipywidgets extension in the environment that runs the notebook server
    jupyter nbextension enable --py widgetsnbextension --sys-prefix && \
    # Also activate ipywidgets extension for JupyterLab
    # Check this URL for most recent compatibilities
    # https://github.com/jupyter-widgets/ipywidgets/tree/master/packages/jupyterlab-manager
    # changing versions of lab extensions to jupyterLab v1.2 compatible
    # jupyter labextension install @jupyter-widgets/jupyterlab-manager@^2.0.0 --no-build && \
    jupyter labextension install @jupyter-widgets/jupyterlab-manager@^1.1 --no-build && \
    # jupyter labextension install @bokeh/jupyter_bokeh@^2.0.0 --no-build && \
    jupyter labextension install @bokeh/jupyter_bokeh@^1.0.0 --no-build && \
    # This labextension doesn't seem to be worth the effort
    # jupyter labextension install jupyter-matplotlib@^0.7.2 --no-build && \
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
