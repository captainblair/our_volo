import requests
import json
import logging
from http.client import HTTPConnection

# Enable verbose HTTP logging
HTTPConnection.debuglevel = 1
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Test configuration
BASE_URL = 'http://localhost:8000'
LOGIN_URL = f'{BASE_URL}/api/auth/token/'
TEST_EMAIL = 'test@volo.africa'
TEST_PASSWORD = 'Test@1234'

def test_login():
    """Test the login endpoint"""
    # Test with form data
    logger.info("\n=== Testing login with form data ===")
    try:
        response = requests.post(
            LOGIN_URL,
            data=f'email={TEST_EMAIL}&password={TEST_PASSWORD}',
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            timeout=10
        )
        
        logger.info(f"Status Code: {response.status_code}")
        logger.info("Response Headers:")
        for header, value in response.headers.items():
            logger.info(f"  {header}: {value}")
            
        logger.info("\nResponse Body:")
        try:
            data = response.json()
            logger.info(json.dumps(data, indent=2))
            if 'access' in data:
                logger.info("Login successful!")
            else:
                logger.error("Login failed - no access token in response")
        except json.JSONDecodeError:
            logger.error(f"Response is not valid JSON: {response.text}")
            
    except Exception as e:
        logger.error(f"Error during form data login: {str(e)}", exc_info=True)
    
    # Test with JSON data
    logger.info("\n=== Testing login with JSON data ===")
    try:
        response = requests.post(
            LOGIN_URL,
            json={
                'email': TEST_EMAIL,
                'password': TEST_PASSWORD
            },
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout=10
        )
        
        logger.info(f"Status Code: {response.status_code}")
        logger.info("Response Headers:")
        for header, value in response.headers.items():
            logger.info(f"  {header}: {value}")
            
        logger.info("\nResponse Body:")
        try:
            data = response.json()
            logger.info(json.dumps(data, indent=2))
            if 'access' in data:
                logger.info("Login successful!")
            else:
                logger.error("Login failed - no access token in response")
        except json.JSONDecodeError:
            logger.error(f"Response is not valid JSON: {response.text}")
            
    except Exception as e:
        logger.error(f"Error during JSON login: {str(e)}", exc_info=True)

if __name__ == '__main__':
    test_login()
