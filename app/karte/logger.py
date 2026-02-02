"""
Logger Utility für Django-Projekt
Einfaches Importieren und Nutzen für Debug, Info, Warning, Error
"""

import logging
import os
from datetime import datetime

# Logger Name
LOGGER_NAME = "star_trek_logger"

# Log-Datei Pfad
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
LOG_FILE = os.path.join(LOG_DIR, 'app.log')

# Erstelle Log-Verzeichnis falls nicht vorhanden
os.makedirs(LOG_DIR, exist_ok=True)


def get_logger(name=LOGGER_NAME):
    """Holt den Logger, erstelle ihn falls nicht vorhanden"""
    logger = logging.getLogger(name)
    
    # Setze Level nur einmal
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        
        # Formatter für Console (ohne Datum)
        console_handler = logging.StreamHandler()
        console_format = logging.Formatter(
            '%(levelname)s | %(message)s'
        )
        console_handler.setFormatter(console_format)
        console_handler.setLevel(logging.INFO)
        
        # Formatter für Datei (mit Datum und Zeit) - append mode!
        file_handler = logging.FileHandler(LOG_FILE, mode='a', encoding='utf-8')
        file_format = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_format)
        file_handler.setLevel(logging.DEBUG)
        
        # Handler hinzufügen
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
    
    return logger


def debug(message, error_type=None):
    """
    Debug Nachricht ausgeben
    
    Args:
        message: Die Nachricht
        error_type: Optional, Typ des Fehlers
    """
    logger = get_logger()
    if error_type:
        logger.debug(f"[{error_type}] {message}")
    else:
        logger.debug(message)


def info(message, error_type=None):
    """
    Info Nachricht ausgeben
    
    Args:
        message: Die Nachricht
        error_type: Optional, Typ des Fehlers
    """
    logger = get_logger()
    if error_type:
        logger.info(f"[{error_type}] {message}")
    else:
        logger.info(message)


def warning(message, error_type=None):
    """
    Warning Nachricht ausgeben
    
    Args:
        message: Die Nachricht
        error_type: Optional, Typ des Fehlers
    """
    logger = get_logger()
    if error_type:
        logger.warning(f"[{error_type}] {message}")
    else:
        logger.warning(message)


def error(message, error_type=None):
    """
    Error Nachricht ausgeben
    
    Args:
        message: Die Nachricht
        error_type: Optional, Typ des Fehlers
    """
    logger = get_logger()
    if error_type:
        logger.error(f"[{error_type}] {message}")
    else:
        logger.error(message)


def critical(message, error_type=None):
    """
    Critical Nachricht ausgeben
    
    Args:
        message: Die Nachricht
        error_type: Optional, Typ des Fehlers
    """
    logger = get_logger()
    if error_type:
        logger.critical(f"[{error_type}] {message}")
    else:
        logger.critical(message)


def exception(message, error_type=None):
    """
    Exception mit Stacktrace ausgeben
    
    Args:
        message: Die Nachricht
        error_type: Optional, Typ des Fehlers
    """
    logger = get_logger()
    if error_type:
        logger.exception(f"[{error_type}] {message}")
    else:
        logger.exception(message)


# Convenience: logger direkt holen
logger = get_logger()

