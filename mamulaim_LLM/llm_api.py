import os
import sys
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout
)
logger = logging.getLogger("recipe_recommendation")

# Configure stdout and stderr to use UTF-8 encoding on Windows to prevent UnicodeEncodeError
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

load_dotenv()

# Import Groq from modular components
from Groq import Groq
