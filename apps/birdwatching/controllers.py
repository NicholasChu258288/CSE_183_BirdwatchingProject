"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email

url_signer = URLSigner(session)

@action('index')
@action.uses('index.html', db, auth, url_signer)
def index():
    return dict(
        load_data_url = URL('load_data'),
    )

@action('load_data', method='GET')
@action.uses(db, auth)
def load_data():
    species_list = db(db.species).select().as_list()
    sightings_list = db(db.sightings).select().as_list()
    checklist_list = db(db.checklists).select().as_list()
    map_list = db(db.sightings.SAMPLING_EVENT_IDENTIFIER == db.checklists.SAMPLING_EVENT_IDENTIFIER).select(db.sightings.COMMON_NAME, db.checklists.LATITUDE, db.checklists.LONGITUDE).as_list()
    return dict(species_list = species_list, sightings_list = sightings_list, checklist_list = checklist_list, map_list = map_list)
