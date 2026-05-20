#!/usr/bin/env python3
"""Test Sarvam API key"""

import os
import requests

api_key = os.environ.get("SARVAM_API_KEY")
api_url = os.environ.get("SARVAM_API_URL", "https://api.sarvam.ai")

print(f"API Key present: {bool(api_key)}")
print(f"API Key length: {len(api_key) if api_key else 0}")
print(f"API Key starts with: {api_key[:15] if api_key else 'None'}...")
print(f"API URL: {api_url}")

if not api_key:
    print("ERROR: SARVAM_API_KEY not set!")
    exit(1)

# Test a simple API call - try the translate endpoint with GET (should fail with 405 but proves connectivity)
headers = {
    "API-Subscription-Key": api_key,
    "Content-Type": "application/json"
}

print("\nTesting API connectivity...")

# Try the translate endpoint
url = f"{api_url}/translate"
payload = {
    "input": "Hello",
    "source_language_code": "en-IN",
    "target_language_code": "hi-IN"
}

print(f"Making request to: {url}")
print(f"Headers: API-Subscription-Key: {api_key[:15]}...")

try:
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    print(f"Response status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.status_code == 200:
        print("\n✅ API KEY IS VALID!")
    elif response.status_code == 403:
        print("\n❌ API KEY IS INVALID OR EXPIRED!")
        print("Please check your key at https://dashboard.sarvam.ai/")
    else:
        print(f"\n⚠️  Unexpected response: {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Request failed: {e}")
