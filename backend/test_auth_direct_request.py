import requests
import json

# Test data
url = "http://localhost:8000/api/auth/token/"
data = {
    'email': 'test@volo.africa',
    'password': 'Test@1234'
}
headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
}

print("Testing authentication with:", url)
print("Email:", data['email'])

# Make the request
response = requests.post(url, data=data, headers=headers)

# Print the response
print("\nResponse Status Code:", response.status_code)
print("Response Headers:", json.dumps(dict(response.headers), indent=2))
print("\nResponse Content:")
try:
    print(json.dumps(response.json(), indent=2))
except:
    print(response.text)
