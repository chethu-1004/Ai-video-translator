#!/usr/bin/env python3
"""Test script to diagnose processing issues"""

import sys
import os

# Add the scripts directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src/scripts'))

print("Python version:", sys.version)
print("Python path:", sys.path[:3])

try:
    print("\n--- Testing imports ---")
    import argparse
    print("✓ argparse")
    import json
    print("✓ json")
    import subprocess
    print("✓ subprocess")
    import tempfile
    print("✓ tempfile")
    from pathlib import Path
    print("✓ pathlib")
    from typing import List, Dict, Optional
    print("✓ typing")
    import math
    print("✓ math")
    import requests
    print("✓ requests")
    import soundfile as sf
    print("✓ soundfile")
    import numpy as np
    print("✓ numpy")
    print("\n✅ All imports successful!")
except ImportError as e:
    print(f"\n❌ Import failed: {e}")
    sys.exit(1)

# Test if Sarvam API key is set
api_key = os.environ.get("SARVAM_API_KEY")
if api_key:
    print(f"\n✅ SARVAM_API_KEY is set (length: {len(api_key)})")
else:
    print("\n❌ SARVAM_API_KEY is NOT set!")
    print("Please add your API key to backend/.env")

# Try to run the actual script import
try:
    print("\n--- Testing process_video_sarvam.py import ---")
    exec(open('src/scripts/process_video_sarvam.py').read())
    print("✅ Script loaded successfully")
except Exception as e:
    print(f"\n❌ Script import failed: {e}")
    import traceback
    traceback.print_exc()
