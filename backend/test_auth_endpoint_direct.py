import requests
import json
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('auth_endpoint_test.log', mode='w', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

def test_auth():
    # Test data
    test_email = 'test@volo.africa'
    test_password = 'Test@1234'
    
    # Test 1: Login with form data
    logger.info("\n=== Testing login with form data ===")
    try:
        response = requests.post(
            'http://localhost:8000/api/auth/token/',
            data={
                'email': test_email,
                'password': test_password
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        logger.info(f"Status code: {response.status_code}")
        try:
            logger.info(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            logger.info(f"Raw response: {response.text}")
            
    except Exception as e:
        logger.error(f"Error during form data login: {str(e)}", exc_info=True)
    
    # Test 2: Login with JSON data
    logger.info("\n=== Testing login with JSON data ===")
    try:
        response = requests.post(
            'http://localhost:8000/api/auth/token/',
            json={
                'email': test_email,
                'password': test_password
            },
            headers={'Content-Type': 'application/json'}
        )
        
        logger.info(f"Status code: {response.status_code}")
        try:
            logger.info(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            logger.info(f"Raw response: {response.text}")
            
    except Exception as e:
        logger.error(f"Error during JSON login: {str(e)}", exc_info=True)

if __name__ == '__main__':
    test_auth()
