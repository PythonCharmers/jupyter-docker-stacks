
Basic additions to jupyter/scipy-notebook.

Main aim is to allow easy management of python packaging via requirements.txt files.

requirements.txt file in this repo is copied to image and installed by pip.

Currently picked a build with v1.2.5 of JupyterLab


## Port forwarding: part 1

Run a new container from the image with:

    sudo docker run -p 8999:8888 pythoncharmers/jupyter-docker-stacks

This forwards port 8888 in the docker container to port 8999 on the EC2 instance.

## Port forwarding: part 2

For local testing / use on your desktop, you can use SSH port forwarding with:

    ssh -i .ssh/my_private_key.pem -NfL localhost:8900:localhost:8999 ubuntu@13.210.62.156

where 8900 is the port on your desktop to forward
      8999 is the port on the EC2 instance (which must also be mapped to the Docker container)
      13.210.... is the IP address of the EC2 instance
