import requests
import json
from http.client import HTTPConnection

# Enable verbose HTTP logging
HTTPConnection.debuglevel = 1

# Test login endpoint
url = 'http://localhost:8000/api/auth/token/'
data = 'email=test@volo.africa&password=Test@1234'
headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
}

print("\n=== Testing Login ===")
print(f"URL: {url}")
print(f"Headers: {json.dumps(headers, indent=2)}")
print(f"Body: {data}")

try:
    # Make the request with streaming disabled to see raw response
    response = requests.post(
        url, 
        data=data, 
        headers=headers,
        stream=False  # Important to read response content immediately
    )
    
    print("\n=== Response ===")
    print(f"Status Code: {response.status_code}")
    print("Headers:")
    for header, value in response.headers.items():
        print(f"  {header}: {value}")
    
    print("\nResponse Body:")
    try:
        print(json.dumps(response.json(), indent=2))
    except ValueError:
        print(response.text)
    
except Exception as e:
    print(f"\n=== Error ===")
    print(f"Type: {type(e).__name__}")
    print(f"Message: {str(e)}")
    if hasattr(e, 'response'):
        print(f"Response status: {e.response.status_code}")
        print(f"Response text: {e.response.text}")
