FROM jupyter/scipy-notebook:hub-4.0.2

USER root
RUN apt-get update
RUN apt-get install daemonize

# > Add System Tools

USER $NB_USER
# supplementary package - for controlled git pulling into images accross whole cluster
RUN pip install --no-cache-dir nbgitpuller supervisor watchdog[watchmedo]

# >> More random apt installs
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
        openssh-client \
        openssh-server \
        tshark \
        cmake \
        file \
        tcpdump \
        libpcap-dev \
        psmisc \
        net-tools \
        telnet \
        tesseract-ocr \
        imagemagick \
        fd-find \
        ffmpeg \
        dvipng \
        nginx \
        redis \
        && apt-get clean && rm -rf /var/lib/apt/lists/*

# >> Install ngrok
RUN wget -O /tmp/ngrok_install.zip https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip && \
    unzip /tmp/ngrok_install.zip -d /usr/local/bin


# Go back to nb_user at end and before copying exec command script (just in case permissions are affected)
USER $NB_USER

# >>> ?Install custom theme and desired labextensionsas an extension
# RUN pip install jupyterlab_sql==0.3.3 jupyterlab-git==0.10.1 && \
#     jupyter labextension install /home/$NB_USER/.jupyter/lab/course_theme --no-build && \
#     jupyter labextension install jupyterlab-python-file@0.3.0 --no-build && \
#     jupyter labextension install jupyterlab-plotly@4.7.1 --no-build && \
#     jupyter labextension install plotlywidget@4.7.1 --no-build && \
#     jupyter serverextension enable jupyterlab_sql --py --sys-prefix && \
#     jupyter lab build -y && \
#     jupyter lab clean -y && \
#     rm -rf /home/$NB_USER/.cache/yarn && \
#     rm -rf /home/$NB_USER/.jupyter/lab/course_theme && \
#     npm cache clean --force


USER root

# >>> Custom Jupyter Lab User Settings
# Where the overrides.json does not work (for shortcut keys for instance) ...
# These user settings  from lab_user_settings are being supplanted into the settings dir
# Does potentially create conflicts/redudance that should be cleaned up
# Copied to /tmp to copied into home later (by pre or post start script)
# Overrides now work well even for key bindings ... redundant
# RUN mkdir -p /tmp/.jupyter/lab/user-settings/'@jupyterlab'
# COPY lab_user_settings/ /tmp/.jupyter/lab/user-settings/'@jupyterlab'

# Ensure that jupyterlab uses user settings in persistent home directory
RUN mkdir -p /tmp/.jupyter/lab/user-settings/'@jupyterlab'
ENV JUPYTERLAB_SETTINGS_DIR=/home/$NB_USER/.jupyter/lab/user-settings
# allow user settings to be changed by user!
#RUN fix-permissions /home/$NB_USER/.jupyter/lab


# > JupyterLab installations

# >> Add groups and fix permissions
USER root
# groupadd necessary now with newer EFSs?
RUN groupadd -g 2000 shared && \
    groupadd -g 2001 data && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER

USER $NB_USER


# >> Testing suite for the image
# For testing the image
COPY testing_imports.ipynb /tmp/Testing_imports.ipynb
# For testing outside of the hub
COPY ./AAPL.h5 /tmp/AAPL.h5

# TODO: one of the themes below is not compatible with the latest jupyterlab; needs to be fixed?
#RUN pip install --no-cache-dir jupyterlab_legos_ui  && \
#    pip install --no-cache-dir jupyterlab_darkside_ui

# >> jupyterlab-git
# Install jupyterlab-git, jupyter dash extension (works?)
RUN pip install --no-cache-dir --upgrade jupyterlab jupyterlab-git

RUN pip install --no-cache-dir jupyter-dash

# RUN pip install jupyterlab-git && \
#     # course_theme needs to be updated to latest version of jupyterlab
#     # jupyter labextension install /home/$NB_USER/.jupyter/lab/course_theme --no-build && \
#      # dev-build=False should prevent massive JS payload
#      # necessary, as True by default when local extension is installed
#      jupyter lab build -y --dev-build=False && \
#      jupyter lab clean -y && \
#      rm -rf /home/$NB_USER/.cache/yarn && \
#      rm -rf /home/$NB_USER/.jupyter/lab/course_theme && \
#      npm cache clean --force


# > Python Packaging
# Python packaging for workshops is controlled through requirements.txt file
# Copy to image and use to install packages

# >> Conda installs
# We need conda to install some stuff becuase of weirdness with packaging
# because we're using conda

# Set mamba solver (supposed to be _way_ faster than the classic one)
RUN conda update -n base conda
RUN conda install -n base conda-libmamba-solver && \
    conda config --set solver libmamba

# This one is potentially problematic
RUN pip install -vvv gensim

# TODO: the file below has no versions; Put the versions
COPY conda_requirements.txt /tmp/conda_requirements.txt
RUN conda install --quiet --yes \
    --file /tmp/conda_requirements.txt && \
    conda clean --all -f -y

# >> Conda-forge installs
# TODO: the file below has no versions; Put the versions
COPY conda_forge_requirements.txt /tmp/conda_forge_requirements.txt
RUN conda install --yes \
    --channel conda-forge \
    --file /tmp/conda_forge_requirements.txt && \
    conda clean --all -f -y

# >> pip installs
# These come last since they have less (so much less) in the way of
# side effects

ENV SKLEARN_ALLOW_DEPRECATED_SKLEARN_PACKAGE_INSTALL=True

# Some packages were moved to pip after unsuccessfully trying to install them via conda
COPY fixed_pip_requirements.txt /tmp/fixed_pip_requirements.txt
RUN pip install --no-cache-dir -r /tmp/fixed_pip_requirements.txt 

# Some packages were moved to conda after unsuccessfully trying to install them via pip
COPY fixed_conda_requirements.txt /tmp/fixed_conda_requirements.txt
RUN conda install --yes --file /tmp/fixed_conda_requirements.txt && \
    conda clean --all -f -y

# >> Install altair data server from GitHub (as no recent released)
# Necessary to use with proxy server on hub (which is in requirements.txt)
# from latest commit as of 2021-01-18

RUN pip install git+https://github.com/altair-viz/altair_data_server.git@b0fdb38205877df7833481baa04b26ac6a9a245e

# >> Voila
RUN pip install -U voila

# scikit-learn
RUN conda install --quiet --yes scikit-learn && conda clean --all -f -y

# >> PyTorch (with CUDA)
RUN pip install --no-cache-dir torch torchvision

# >> !! Temporary fixes

# SHOULD FOLD THESE INTO A CLEAN BUILD FOR NEXT MAJOR REVISION!

# >>> for h5py
# see https://github.com/h5py/h5py/issues/1880
# an error with "undefined symbol: H5Pset_fapl_ros3" arises
# Pinnning a downgrade to less than h5py=3.2 seems to do the trick

RUN conda install --quiet --yes scikit-learn h5py

# >>> black downgrade
# to be compatible with fiona and click <8.0.0
# see https://github.com/psf/black/issues/2774
RUN pip install -U black

# >>> jupyter-dash
# some bug with jupyter-dash requires build and prompts for a build on log-in?

RUN pip uninstall --yes jupyter-dash

# >>> More Testing Resources
# should remove testing notebook copy from above
# and put it lower in the dockerfile so that it can be updated
# more easily

COPY testing_resources/ /tmp/testing_resources/




# > Config and processes

# >> ?Folders for config and log files
# # no longer running supervisor?
# RUN mkdir /etc/supervisor
# RUN mkdir /etc/supervisor/conf.d
# RUN mkdir /var/log/supervisor
# RUN mkdir /var/run/supervisor
# # NB_USER write permissions for log and running files as supervisor being run by NB_USER
# RUN fix-permissions /var/log/supervisor
# RUN fix-permissions /var/run/supervisor

# # >> ?Copying config files for supervisor and watchmedo
# COPY supervisord.conf /etc/supervisor/supervisord.conf
# COPY watchmedo.conf /etc/supervisor/conf.d/watchmedo.conf

# >> ?setting up custom jupyter css and js for original notebook
# old notebook will be deprecated soon for the jupyterlab based simple nb
# using this location as already used by scipy-notebook
RUN mkdir -p /etc/jupyter/custom
COPY custom /etc/jupyter/custom

USER root
RUN fix-permissions /etc/jupyter
USER $NB_USER

# Ensure /etc/jupyter is used as source of config
# TODO: fix
#ENV JUPYTER_CONFIG_DIR=/etc/jupyter/

# >> Watchmedo_tricks
# May need to be configured for kubernetes specific setup
# (with mounted and separate HOME dir)

# COPY .watchdog_tricks.yml /home/$NB_USER/.watchdog_tricks.yml
# COPY .watchdog_tricks.yml /tmp/.watchdog_tricks.yml

# >> ?Data Symlink
# Not needed as done by ansible setup
# Permissions may not need to be set here, as the symlink is simply read
# Permissions should come from those on the target of the link
# Done as root in case necessary for writing to / dir
# RUN ln -s /home/data/Data /Data && \
#         ln -s /home/$NB_USER /Work

USER root
# sighs ... this needs to be done here because jovyan doesn't have permission to do so
# does hard code the data path in the docker build, which is not a nice spot for it
# ... maybe rely on just the home directoy link instead
Run ln -s /home/data/Data /Data
# >> Setup keyring
# keyring requires setup to run on a headless server (something to do with the way the user sessions are managed...). The work-around is a keyring extension and a manual config:

USER $NB_USER

COPY keyringrc.cfg /tmp/keyringrc.cfg

# >> Add env variables for cached data
# ENV commands don't create unnecessary intermediate layers
ENV NLTK_DATA=/home/data/Data/nltk_data
ENV SCIKIT_LEARN_DATA=/home/data/Data/scikit_learn_data
ENV YELLOWBRICK_DATA=/home/data/Data/yellowbrick_data
ENV SURPRISE_DATA_FOLDER=/home/data/Data/surprise_data


# > Get the tika jar
USER $NB_USER

# what is this!!
# RUN wget -O /tmp/tika-server.jar https://repo1.maven.org/maven2/org/apache/tika/tika-server/1.24.1/tika-server-1.24.1.jar
# RUN wget -O /tmp/tika-server.jar.md5 https://repo1.maven.org/maven2/org/apache/tika/tika-server/1.24.1/tika-server-1.24.1.jar.md5

# >> Bashrc
# just copy to /tmp
# should probably be done in ansible set up!
COPY .bashrc /tmp/.bashrc


# > ?! Tableau install
# RUN pip install pandleau tableauserverclient
# RUN cd /tmp && \
#     wget https://downloads.tableau.com/tssoftware/extractapi-py-linux-x86_64-2019-2-6.tar.gz && \
#     tar xf extractapi-py-linux-x86_64-2019-2-6.tar.gz && \
#     find . -maxdepth 1 -iname 'hyperextractapi*' -type d | awk 'NR==1' | xargs -I d pip install d

# RUN pip cache purge

# USER root

# # to work around a sudo bug in containers for the install below
# RUN echo "Set disable_coredump false" >> /etc/sudo.conf

# # install binaries necessary for tableau export and ubuntu focus 20.04
# RUN sudo apt-get update && \
#     sudo apt-get install libpcre16-3 && \
#     sudo ln -s /usr/lib/x86_64-linux-gnu/libpcre16.so.3 /usr/lib/x86_64-linux-gnu/libpcre16.so.0 && \
#     sudo apt-get install libtinfo5

# ENV TAB_SDK_LOGDIR=/tmp/
# ENV TAB_SDK_TMPDIR=/tmp/

# RUN fix-permissions "${CONDA_DIR}" && \
#     fix-permissions "/home/${NB_USER}"


# >>> Custom Override Settings
# These overrides are at the "application level" and can be overwritten by the user
# These user settings, which will overwrite these overrides, are stored in /home/$NB_UID/
# which, in kubernetes, are stored on a separate and persistent drive
USER root
RUN mkdir -p /opt/conda/share/jupyter/lab/settings 
COPY overrides.json /opt/conda/share/jupyter/lab/settings/ 

RUN chmod 777 -R /home/jovyan/.cache/

# install extra libs
USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends sudo wget

USER root
RUN usermod -aG sudo jovyan
RUN echo 'jovyan ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

# install VSCode (code-server) extension
COPY open_in_vscode/ /opt/conda/share/jupyter/lab/extensions/open_in_vscode
RUN chmod 777 -R /opt/conda/share/jupyter/lab/extensions/
RUN cp /opt/conda/share/jupyter/lab/extensions/open_in_vscode/open_in_vscode/vs_code_opener.py /usr/local/bin
RUN chmod +x /usr/local/bin/vs_code_opener.py
USER $NB_USER
RUN export PATH="/opt/conda/bin:$PATH" && \
    cd /opt/conda/share/jupyter/lab/extensions/open_in_vscode && \
    pip install -e . && \
    jupyter lab build && \
    jupyter server extension enable open_in_vscode

# disable pop-up "Would you like to receive official Jupyter news?"
RUN jupyter labextension disable "@jupyterlab/apputils-extension:announcements"


USER root

CMD ["/etc/init.d/redis-server", "start"]

# install VSCode (code-server) itself
RUN curl -fsSL https://code-server.dev/install.sh | sh


COPY prepare.sh /usr/local/bin/prepare.sh
RUN chmod +x /usr/local/bin/prepare.sh
COPY start_procs.sh /usr/local/bin/start_procs.sh
RUN chmod +x /usr/local/bin/start_procs.sh


RUN prepare.sh


# install pip if needed (seen weird errors)
RUN /opt/conda/bin/python3.11 -m ensurepip

# monkey-patching buggy eli5 library (see https://github.com/eli5-org/eli5/issues/39)
COPY fixed_eli5/permutation_importance.py /opt/conda/lib/python3.11/site-packages/eli5/sklearn/permutation_importance.py
COPY fixed_eli5/utils.py /opt/conda/lib/python3.11/site-packages/eli5/lime/utils.py

# install custom pythoncharmers theme
COPY pythoncharmers_theme/ /opt/conda/share/jupyter/lab/extensions/pythoncharmers_theme
RUN chmod 777 -R /opt/conda/share/jupyter/lab/extensions/
USER $NB_USER
RUN export PATH="/opt/conda/bin:$PATH" && \
    cd /opt/conda/share/jupyter/lab/extensions/pythoncharmers_theme && \
    pip install -e . && jupyter lab build 

# main entry point
USER $NB_USER
ENTRYPOINT ["start_procs.sh"]


# > End on NB_USER
USER $NB_USER

