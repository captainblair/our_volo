# Local development settings - override these in production
from .settings import *

# Add testserver to ALLOWED_HOSTS for test client
ALLOWED_HOSTS = list(ALLOWED_HOSTS) + ['testserver']

# Enable more verbose logging for debugging
LOGGING['loggers']['django']['level'] = 'DEBUG'
LOGGING['loggers']['django.request']['level'] = 'DEBUG'
