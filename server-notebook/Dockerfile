# Build of jupyter/scipy-notebook from before jupyterlab was bumped up to v2
FROM jupyter/scipy-notebook:e255f1aa00b2
# FROM pythoncharmers/scipy-notebook:latest

USER $NB_UID

# > Python Packaging
# Python packaging for workshops is controlled through requirements.txt file
# Copy to image and use to install packages
COPY requirements.txt /home/$NB_UID/requirements.txt
RUN pip install --no-cache-dir -r /home/$NB_UID/requirements.txt

# >> jupyter nbextension
# Jupyter nbextension installation and acivation
# Relies on jupyter_contrib_nbextensions installation
RUN jupyter contrib nbextension install --user
RUN jupyter nbextension enable varInspector/main

# > Custom Tools
# supplementary package - for controlled git pulling into images accross whole cluster
RUN pip install --no-cache-dir nbgitpuller
## Installing and Setting up supervisor and watchmedo
RUN pip install --no-cache-dir supervisor
RUN pip install --no-cache-dir watchdog[watchmedo]

USER root

# > Jupyter Lab

# >> Custom Theme
COPY customtheme/ /home/$NB_USER/.jupyter/lab/course_theme
# Allow user to change their settings
RUN fix-permissions /home/$NB_USER/.jupyter/lab


# Go back to nb_user at end and before copying exec command script (just in case permissions are affected)
USER $NB_USER

# >>> Install custom theme as an extension
RUN jupyter labextension install /home/$NB_USER/.jupyter/lab/course_theme --no-build
RUN jupyter lab build -y && \
    jupyter lab clean -y
# >>> Remove npm/yarn crud from jupyterlab installations
RUN rm -rf /home/$NB_USER/.cache/yarn
RUN rm -rf /home/$NB_USER/.jupyter/lab/course_theme
RUN npm cache clean --force

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

# >> Symlinks and watchmedo_tricks
# May need to be configured for kubernetes specific setup 
# (with mounted and separate HOME dir)

# COPY .watchdog_tricks.yml /home/$NB_USER/.watchdog_tricks.yml
COPY .watchdog_tricks.yml /tmp/.watchdog_tricks.yml

# Permissions may not need to be set here, as the symlink is simply read
# Permissions should come from those on the target of the link
# Done as root in case necessary for writing to / dir
RUN ln -s /home/data/Data /Data && \
	ln -s /home/shared/trainer /trainer && \
	ln -s /home/data/_Materials /_Materials


# > Custom Entrypoint

USER $NB_USER

COPY jupyter_supervisor_start.sh /usr/local/bin/jupyter_supervisor_start.sh

RUN ln -s /home/data/Data /home/$NB_USER/Data && \
	ln -s /home/shared/trainer /home/$NB_USER/trainer && \
	ln -s /home/data/_Materials /home/$NB_USER/_Materials

# New command for when container is executed
# Overwrites CMD entry from base-notebook - only one CMD entry per container
# Purpose is to include supervisord at start of image
CMD ["jupyter_supervisor_start.sh"]
