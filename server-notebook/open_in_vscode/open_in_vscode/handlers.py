import os
import functools
import json
import subprocess
import sys

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url2path, url_path_join
import tornado

try:
    import hybridcontents
except ImportError:
    hybridcontents = None


class BaseHandler(APIHandler):

    @functools.lru_cache()
    def url2localpath(
        self, path: str, with_contents_manager: bool = False
    ):
        """Get the local path from a JupyterLab server path.
        Optionally it can also return the contents manager for that path.
        """
        cm = self.contents_manager

        # Handle local manager of hybridcontents.HybridContentsManager
        if hybridcontents is not None and isinstance(
            cm, hybridcontents.HybridContentsManager
        ):
            _, cm, path = hybridcontents.hybridmanager._resolve_path(path, cm.managers)

        local_path = os.path.join(os.path.expanduser(cm.root_dir), url2path(path))
        return (local_path, cm) if with_contents_manager else local_path


class FileOpenHandler(BaseHandler):

    @tornado.web.authenticated
    async def post(self):
        data = self.get_json_body()

        path = self.url2localpath(data["path"])
        with open('/tmp/__open_file.log', 'a') as fh:
            fh.write(str(path) + '\n')
        os.system(f'vs_code_opener.py {path} &')

        self.finish(json.dumps({
            "success": True
        }))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    handlers = [
        (url_path_join(base_url, "open_in_vscode", "open-file"), FileOpenHandler),
    ]
    web_app.add_handlers(host_pattern, handlers)

