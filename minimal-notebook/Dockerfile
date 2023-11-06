# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.
# ARG BASE_CONTAINER=pythoncharmers/base-notebook:latest
# FROM $BASE_CONTAINER

# Don't forget to keep the dockerhub image updated
FROM pythoncharmers/base-notebook:latest

# Fix: https://github.com/hadolint/hadolint/wiki/DL4006
# Fix: https://github.com/koalaman/shellcheck/wiki/SC3014
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

USER root

# Install all OS dependencies for fully functional notebook server
RUN apt-get update && apt-get install -yq --no-install-recommends \
    git \
    nano \
    curl \
    openssh-client \
    less \
    texlive-xetex \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-plain-generic \
    xclip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Switch back to jovyan to avoid accidental container runs as root
USER $NB_UID
