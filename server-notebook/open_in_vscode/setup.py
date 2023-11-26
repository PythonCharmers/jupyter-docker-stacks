#__import__('setuptools').setup()


from setuptools import setup, find_packages

setup(
    name='open_in_vscode',
    version='0.1.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        # Add your package dependencies here
        'jupyterlab>=4.0.0',
    ],
    entry_points={
        'jupyter_serverproxy_servers': [
            # Assuming you are using jupyter-server-proxy, otherwise use 'jupyter_server.extensions'
            'open_in_vscode = open_in_vscode:open_in_vscode',
        ],
    },
    package_data={
        'open_in_vscode': [
            # Include any package data files here
            # e.g., HTML, JS, CSS files if they are part of your extension
        ],
    },
    data_files=[
        (
            "etc/jupyter/jupyter_server_config.d",
            ["jupyter-config/jupyter_server_config.d/open_in_vscode.json"],
        ),
    ]
)
