import os
import tempfile


def get_data_directory() -> str:
    path = os.path.join("/", "data", "backend")
    if os.path.isdir(path):
        return path
    return tempfile.gettempdir()
