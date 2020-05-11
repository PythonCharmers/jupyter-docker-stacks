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

# >> Config and processes
# Change to root for creating log and config file locations
USER root

# >>> Folders for config and log files
RUN mkdir /etc/supervisor
RUN mkdir /etc/supervisor/conf.d
RUN mkdir /var/log/supervisor
RUN mkdir /var/run/supervisor
# NB_USER write permissions for log and running files as supervisor being run by NB_USER
RUN fix-permissions /var/log/supervisor
RUN fix-permissions /var/run/supervisor

# >>> Copying config files for supervisor and watchmedo
COPY supervisord.conf /etc/supervisor/supervisord.conf
COPY watchmedo.conf /etc/supervisor/conf.d/watchmedo.conf
COPY .watchdog_tricks.yml /home/$NB_USER/.watchdog_tricks.yml

# >> setting up custom jupyter css and js
COPY custom /home/$NB_USER/.jupyter/custom

# > Jupyter Lab
# >> Setting up custom jupyter lab settings
RUN mkdir -p /home/$NB_USER/.jupyter/lab/user-settings/'@jupyterlab'
COPY lab_user_settings/ /home/$NB_USER/.jupyter/lab/user-settings/'@jupyterlab'
COPY customtheme/ /home/$NB_USER/.jupyter/lab/course_theme
# Allow user to change their settings
RUN fix-permissions /home/$NB_USER/.jupyter/lab


# Go back to nb_user at end and before copying exec command script (just in case permissions are affected)
USER $NB_USER

# >> Install custom theme as an extension
RUN jupyter labextension install /home/$NB_USER/.jupyter/lab/course_theme --no-build
RUN jupyter lab build -y && \
    jupyter lab clean -y
# >> Remove npm/yarn crud from jupyterlab installations
RUN rm -rf /home/$NB_USER/.cache/yarn
RUN rm -rf /home/$NB_USER/.jupyter/lab/course_theme
RUN npm cache clean --force

# > Custom Entrypoint
COPY jupyter_supervisor_start.sh /usr/local/bin/jupyter_supervisor_start.sh

RUN ln -s /home/data/Data /home/$NB_USER/Data && \
	ln -s /home/shared/trainer /home/$NB_USER/trainer

# New command for when container is executed
# Overwrites CMD entry from base-notebook - only one CMD entry per container
# Purpose is to include supervisord at start of image
CMD ["jupyter_supervisor_start.sh"]
