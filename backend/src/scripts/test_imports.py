#!/usr/bin/env python3
"""Test if all required imports are available"""

try:
    import argparse
    import json
    import os
    import sys
    import subprocess
    import tempfile
    from pathlib import Path
    from typing import List, Dict, Optional
    import math
    import requests
    import soundfile as sf
    import numpy as np
    print("SUCCESS: All imports working")
except ImportError as e:
    print(f"FAILED: Missing import - {e}")
    sys.exit(1)
