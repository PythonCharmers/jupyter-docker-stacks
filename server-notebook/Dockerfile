# Build of jupyter/scipy-notebook from before jupyterlab was bumped up to v2
FROM jupyter/scipy-notebook:e255f1aa00b2
# FROM pythoncharmers/scipy-notebook:latest

USER root
RUN apt-get update
RUN apt-get install daemonize

USER $NB_USER
# > Fixed Python Packaging


# >> jupyter nbextension
# Jupyter nbextension installation and acivation
# Relies on jupyter_contrib_nbextensions installation
RUN pip install jupyter_contrib_nbextensions && \
        jupyter contrib nbextension install --user && \
        jupyter nbextension enable varInspector/main

# > Custom Tools
# supplementary package - for controlled git pulling into images accross whole cluster
RUN pip install --no-cache-dir nbgitpuller supervisor watchdog[watchmedo]

USER root

# > Jupyter Lab

# >> Custom Theme
COPY customtheme/ /home/$NB_USER/.jupyter/lab/course_theme
# Allow user to change their settings
RUN fix-permissions /home/$NB_USER/.jupyter/lab


# Go back to nb_user at end and before copying exec command script (just in case permissions are affected)
USER $NB_USER

# >>> Install custom theme and desired labextensionsas an extension
RUN pip install jupyterlab_sql==0.3.3 jupyterlab-git==0.10.1 && \
    jupyter labextension install /home/$NB_USER/.jupyter/lab/course_theme --no-build && \
    jupyter labextension install jupyterlab-python-file@0.3.0 --no-build && \
    jupyter labextension install jupyterlab-plotly@4.7.1 --no-build && \
    jupyter labextension install plotlywidget@4.7.1 --no-build && \
    jupyter serverextension enable jupyterlab_sql --py --sys-prefix && \
    jupyter lab build -y && \
    jupyter lab clean -y && \
    rm -rf /home/$NB_USER/.cache/yarn && \
    rm -rf /home/$NB_USER/.jupyter/lab/course_theme && \
    npm cache clean --force


# >>> Remove npm/yarn crud from jupyterlab installations

# >>> Custom Override Settings
# These overrides are at the "application level" and can be overwritten by the user
# These user settings, which will overwrite these overrides, are stored in /home/$NB_UID/
# which, in kubernetes, are stored on a separate and persistent drive
USER root
RUN mkdir -p /opt/conda/share/jupyter/lab/settings
COPY overrides.json /opt/conda/share/jupyter/lab/settings/

# > Config and processes

# >> Folders for config and log files
RUN mkdir /etc/supervisor
RUN mkdir /etc/supervisor/conf.d
RUN mkdir /var/log/supervisor
RUN mkdir /var/run/supervisor
# NB_USER write permissions for log and running files as supervisor being run by NB_USER
RUN fix-permissions /var/log/supervisor
RUN fix-permissions /var/run/supervisor

# >> Copying config files for supervisor and watchmedo
COPY supervisord.conf /etc/supervisor/supervisord.conf
COPY watchmedo.conf /etc/supervisor/conf.d/watchmedo.conf

# >> setting up custom jupyter css and js for original notebook
# using this location as already used by scipy-notebook
RUN mkdir -p /etc/jupyter/custom
COPY custom /etc/jupyter/custom
RUN fix-permissions /etc/jupyter
# Ensure /etc/jupyter is used as source of config
ENV JUPYTER_CONFIG_DIR=/etc/jupyter/
# Ensure that jupyterlab uses user settings in persistent home directory
ENV JUPYTERLAB_SETTINGS_DIR=/home/$NB_USER/.jupyter/lab/user-settings

# >> Symlinks and watchmedo_tricks
# May need to be configured for kubernetes specific setup
# (with mounted and separate HOME dir)

# COPY .watchdog_tricks.yml /home/$NB_USER/.watchdog_tricks.yml
COPY .watchdog_tricks.yml /tmp/.watchdog_tricks.yml

# Permissions may not need to be set here, as the symlink is simply read
# Permissions should come from those on the target of the link
# Done as root in case necessary for writing to / dir
RUN ln -s /home/data/Data /Data && \
        ln -s /home/shared/trainer /Trainer && \
        ln -s /home/data/Materials /Materials && \
        ln -s /home/$NB_USER /Work


# > Custom Entrypoint

USER $NB_USER

COPY jupyter_supervisor_start.sh /usr/local/bin/jupyter_supervisor_start.sh
COPY postStart.sh /tmp/postStart.sh

#RUN ln -s /home/data/Data /home/$NB_USER/Data && \
#	ln -s /home/shared/trainer /home/$NB_USER/trainer && \
#	ln -s /home/data/_Materials /home/$NB_USER/_Materials

# New command for when container is executed
# Overwrites CMD entry from base-notebook - only one CMD entry per container
# Purpose is to include supervisord at start of image

# Now redundant with postStart.sh
# CMD ["jupyter_supervisor_start.sh"]

# > More random apt installs
USER root

# Install all OS dependencies for fully functional notebook server
RUN apt-get update && apt-get install -yq --no-install-recommends \
        vim-nox \
        less \
        tree \
        graphviz \
        colordiff \
        silversearcher-ag \
        jq \
        psmisc \
        zip \
        screen \
        tmux \
        highlight \
        build-essential \
        rsync \
        && apt-get clean && rm -rf /var/lib/apt/lists/*

# > Install ngrok
RUN wget -O /tmp/ngrok_install.zip https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip && \
    unzip /tmp/ngrok_install.zip -d /usr/local/bin

USER $NB_USER

# > Setup keyring
# keyring requires setup to run on a headless server (something to do with the way the user sessions are managed...). The work-around is a keyring extension and a manual config:

COPY keyringrc.cfg /tmp/keyringrc.cfg

# > Python Packaging
# Python packaging for workshops is controlled through requirements.txt file
# Copy to image and use to install packages

# >> Conda installs
# We need conda to install some stuff becuase of weirdness with packaging
# because we're using conda

COPY conda_requirements.txt /tmp/conda_requirements.txt
RUN conda install --quiet --yes \
    --file /tmp/conda_requirements.txt && \
    conda clean --all -f -y && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER


# >> pip installs
# These come last since they have less (so much less) in the way of
# side effects

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY .bashrc /tmp/.bashrc

USER root
RUN groupadd -g 2000 shared && \
    groupadd -g 2001 data

USER $NB_USER
