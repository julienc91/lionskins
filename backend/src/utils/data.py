# -*- coding: utf-8 -*-

import os
import tempfile


def get_data_directory():
    path = os.path.join("/", "data", "backend")
    if os.path.isdir(path):
        return path
    return tempfile.gettempdir()
