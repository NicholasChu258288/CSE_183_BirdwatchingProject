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
from py4web.utils.form import Form, FormStyleBulma
from py4web.utils.grid import Grid, GridClassStyleBulma
from datetime import datetime
import uuid

url_signer = URLSigner(session)

@action('index')
@action.uses('index.html', db, auth, url_signer)
def index():
    return dict(
        load_data_url = URL('load_data'),
    )

@action('checklist/<location>')
@action('checklist')
@action.uses('checklist.html', auth.user, db)
def checklist():
    form = Form(db.checklists, formstyle=FormStyleBulma)
    if form.accepted:
        redirect(URL('edit_checklist', form.vars.id))
    
    return dict(
        form=form,
        get_species_url = URL('get_species'),
        submit_checklist_url = URL('submit_checklist')
    )

@action('my_checklists/<path:path>', method=['GET', 'POST'])
@action('my_checklists', method=['GET', 'POST'])
@action.uses('my_checklists.html', db, auth)
def my_checklist(path=None):
    observer_email = get_user_email()
    if not observer_email:
        redirect(URL('index'))

    # Join sightings table to retrieve count and name
    query = (db.checklists.OBSERVER_ID == observer_email)
    query = query & (db.checklists.SAMPLING_EVENT_IDENTIFIER == db.sightings.SAMPLING_EVENT_IDENTIFIER)
    sightings_count = db.sightings.OBSERVATION_COUNT
    sightings_name = db.sightings.COMMON_NAME
    grid = Grid(path,
                formstyle=FormStyleBulma,
                grid_class_style=GridClassStyleBulma,
                query=query,
                fields=[sightings_name, sightings_count, db.checklists.SAMPLING_EVENT_IDENTIFIER, db.checklists.LATITUDE, db.checklists.LONGITUDE, db.checklists.OBSERVATION_DATE, db.checklists.DURATION_MINUTE],
                search_queries=[
                    ['Search by Name', lambda val: db.sightings.COMMON_NAME.contains(val)],
                ]
                )

    return dict(grid=grid)


@action('user_stats/<location>')
@action('user_stats')
@action.uses('user_stats.html', auth.user, db)
def user_stats():
    observer_email = get_user_email()
    if not observer_email:
        redirect(URL('index'))
 
    return dict(
        get_species_url = URL('get_species'),
        submit_checklist_url = URL('submit_checklist'),
        load_user_stats_url = URL('load_user_stats'),
        get_user_species_url = URL('get_user_species'),
        get_current_user_email_url=URL('get_current_user_email'),
    )

@action('load_user_stats', method='GET')
@action.uses(db, auth)
def load_user_stats():
    observer_email = get_user_email()
    user_list = db(db.checklists.OBSERVER_ID == observer_email).select(orderby=~db.checklists.OBSERVATION_DATE).as_list()
    return dict(
        user_list = user_list,
    )

@action('get_sightings', method=['GET'])
@action.uses(db, auth)
def get_sightings():
    try:
        limit = int(request.params.get('limit', 100))
        offset = int(request.params.get('offset', 0))
        sightings_list = db(db.sightings).select(limitby=(offset, offset + limit)).as_list()
        return dict(sightings_list=sightings_list)
    except Exception as e:
        return dict(error=str(e))
    
@action('get_species', method=['GET'])
@action.uses(db, auth)
def get_species():
    species_list = db(db.species).select(orderby=db.species.COMMON_NAME)
    return dict(species_list=species_list)

@action('submit_checklist', method='POST')
@action.uses(db, auth)
def submit_checklist():
    data = request.json
    if not data:
        return dict(success=False, message="No data received")
    
    observer_id = get_user_email()
    if not observer_id:
        return dict(success=False, message="User not authenticated")
    
    # Generate a new unique identifier for the sampling event
    sampling_event_identifier = str(uuid.uuid4())
    
    # Insert new entry into the sightings table
    db.sightings.insert(
        SAMPLING_EVENT_IDENTIFIER=sampling_event_identifier,
        COMMON_NAME=data.get('COMMON_NAME'),
        OBSERVATION_COUNT=data.get('observationCount')
    )
    
    # Insert new entry into the checklists table
    db.checklists.insert(
        SAMPLING_EVENT_IDENTIFIER=sampling_event_identifier,
        LATITUDE=data.get('LATITUDE'),
        LONGITUDE=data.get('LONGITUDE'),
        OBSERVATION_DATE=datetime.now().isoformat(),  # Use current datetime
        OBSERVER_ID=observer_id,
        DURATION_MINUTE=data.get('DURATION_MINUTE')
    )
    
    return dict(success=True, message="Checklist submitted successfully")

@action('load_data', method='GET')
@action.uses(db, auth)
def load_data():
    species_list = db(db.species).select().as_list()
    sightings_list = db(db.sightings).select().as_list()
    checklist_list = db(db.checklists).select().as_list()
    map_list = db(db.sightings.SAMPLING_EVENT_IDENTIFIER == db.checklists.SAMPLING_EVENT_IDENTIFIER).select(db.sightings.COMMON_NAME, db.checklists.LATITUDE, db.checklists.LONGITUDE).as_list()
    # print("Loading data:")
    # print("Species list:", species_list)
    # print("Sightings list:", sightings_list)
    # print("Checklist list:", checklist_list)
    # print("Map list:", map_list)
    return dict(
        species_list=species_list,
        sightings_list=sightings_list,
        checklist_list=checklist_list,
        map_list=map_list
    )


@action('api/sightings_over_time', method=['GET'])
@action.uses(db)
def sightings_over_time():
    species = request.params.get('species')
    if not species:
        return dict(error="Species not provided")

    sightings_data = db((db.sightings.COMMON_NAME == species) &
                        (db.sightings.SAMPLING_EVENT_IDENTIFIER == db.checklists.SAMPLING_EVENT_IDENTIFIER)
                       ).select(db.checklists.OBSERVATION_DATE, db.sightings.OBSERVATION_COUNT.sum(),
                                groupby=db.checklists.OBSERVATION_DATE,
                                orderby=db.checklists.OBSERVATION_DATE)

    return dict(
        dates=[row.checklists.OBSERVATION_DATE for row in sightings_data],
        counts=[row[db.sightings.OBSERVATION_COUNT.sum()] for row in sightings_data]
    )



@action('location')
@action.uses('location.html', db)
def location():
    return dict()

@action('api/location_stats', method=['GET'])
@action.uses(db)
def location_stats():
    coord1 = request.params.get('coord1')
    coord2 = request.params.get('coord2')
    if not coord1 or not coord2:
        return dict(error="Coordinates not provided")

    coord1 = list(map(float, coord1.strip('[]').split(',')))
    coord2 = list(map(float, coord2.strip('[]').split(',')))
    print 

    species_data = db((db.checklists.LATITUDE >= min(coord1[0], coord2[0])) & 
                      (db.checklists.LATITUDE <= max(coord1[0], coord2[0])) &
                      (db.checklists.LONGITUDE >= min(coord1[1], coord2[1])) & 
                      (db.checklists.LONGITUDE <= max(coord1[1], coord2[1])) &
                      (db.sightings.SAMPLING_EVENT_IDENTIFIER == db.checklists.SAMPLING_EVENT_IDENTIFIER) &
                      (db.sightings.COMMON_NAME == db.species.COMMON_NAME)
                     ).select(db.species.ALL, db.sightings.OBSERVATION_COUNT.sum(),
                              groupby=db.sightings.COMMON_NAME)
    print(species_data)

    top_contributors = db((db.checklists.LATITUDE >= min(coord1[0], coord2[0])) & 
                          (db.checklists.LATITUDE <= max(coord1[0], coord2[0])) &
                          (db.checklists.LONGITUDE >= min(coord1[1], coord2[1])) & 
                          (db.checklists.LONGITUDE <= max(coord1[1], coord2[1])) &
                          (db.sightings.SAMPLING_EVENT_IDENTIFIER == db.checklists.SAMPLING_EVENT_IDENTIFIER)
                         ).select(db.checklists.OBSERVER_ID, db.sightings.OBSERVATION_COUNT.sum(),
                                  groupby=db.checklists.OBSERVER_ID,
                                  orderby=~db.sightings.OBSERVATION_COUNT.sum())

    return dict(species_list=[dict(COMMON_NAME=row.species.COMMON_NAME, count=row[db.sightings.OBSERVATION_COUNT.sum()]) for row in species_data],
                top_contributors=[dict(user=row.checklists.OBSERVER_ID, count=row[db.sightings.OBSERVATION_COUNT.sum()]) for row in top_contributors])

@action('get_user_species', method=['GET'])
@action.uses(db, auth)
def get_user_species():
    observer_email = get_user_email()

    if not observer_email:
        return dict(error="Observer email is required.")

    # Step 1: Query the `checklists` table for the observer's checklists
    observer_checklists = db(db.checklists.OBSERVER_ID == observer_email).select(db.checklists.SAMPLING_EVENT_IDENTIFIER)

    if not observer_checklists:
        return dict(error="No checklists found for the specified observer.")

    # Step 2: Extract the `SAMPLING_EVENT_IDENTIFIER` values
    sampling_event_ids = [row.SAMPLING_EVENT_IDENTIFIER for row in observer_checklists]

    # Step 3: Query the `sightings` table for sightings matching these `SAMPLING_EVENT_IDENTIFIER` values
    sightings = db(db.sightings.SAMPLING_EVENT_IDENTIFIER.belongs(sampling_event_ids)).select(
        db.sightings.COMMON_NAME, db.sightings.OBSERVATION_COUNT,
        orderby=~db.sightings.OBSERVATION_COUNT  # Order by count descending
    )

    if not sightings:
        return dict(error="No sightings found for the specified checklists.")

    # Step 4: Sum the observation counts for each unique common name
    species_count = {}
    for sighting in sightings:
        common_name = sighting.COMMON_NAME
        count = int(sighting.OBSERVATION_COUNT) if sighting.OBSERVATION_COUNT.isdigit() else 0
        if common_name in species_count:
            species_count[common_name] += count
        else:
            species_count[common_name] = count

    # Convert the dictionary to a list of dictionaries for easy JSON serialization
    unique_species_data = [{"name": name, "count": count} for name, count in species_count.items()]

    # Sort the unique_species_data list alphabetically by species name
    unique_species_data.sort(key=lambda x: x["name"])

    # Return the list of unique common names with their counts
    return dict(unique_species_data=unique_species_data)


@action('get_current_user_email')
@action.uses(auth.user)
def get_current_user_email():
    return get_user_email()
