import requests
import json

# Test login endpoint
url = 'http://localhost:8000/api/auth/token/'
data = {
    'email': 'test@volo.africa',
    'password': 'Test@1234'
}
headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
}

print("Testing login with:", data)
response = requests.post(url, data=data, headers=headers)

print("\nStatus Code:", response.status_code)
print("Response:")
try:
    print(json.dumps(response.json(), indent=2))
except:
    print(response.text)
