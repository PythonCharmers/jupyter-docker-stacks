#!/usr/bin/env python3

import sys
import time
import subprocess


def run_command_until_success(command, max_attempts):
    for attempt in range(max_attempts):
        result = subprocess.run(command, shell=True)
        if result.returncode == 0:
            return True
        else:
            time.sleep(0.3)
    return False


if __name__ == '__main__':
    fname = sys.argv[1]
    max_attempts = 30
    cmd = f'code-server -r {fname}'
    run_command_until_success(cmd, max_attempts)
