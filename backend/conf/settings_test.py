"""Test settings: run the suite against an in-memory SQLite DB.

The business logic under test (wallet ledger math, goal staking) is
database-agnostic, so this gives a fast, hermetic test loop without needing a
MySQL server. Production still uses MySQL via conf.settings.

    DJANGO_SETTINGS_MODULE=conf.settings_test python manage.py test
"""
import tempfile

from .settings import *  # noqa: F401,F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']

# Keep uploaded test files out of the project tree.
MEDIA_ROOT = tempfile.mkdtemp(prefix='nxt-test-media-')
