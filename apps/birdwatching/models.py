"""
This file defines the database models
"""

import datetime
from .common import db, Field, auth
from pydal.validators import *

import csv #Used for priming the db with data from the provided csv files


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later

db.define_table(
    'species',
    Field('COMMON_NAME', 'string', requires=IS_NOT_EMPTY()),
)

db.define_table(
    'sightings',
    Field('SAMPLING_EVENT_IDENTIFIER', 'string'),
    Field('COMMON_NAME', 'string'),
    Field('OBSERVATION_COUNT', 'string'), #'integer'
)

db.define_table(
    'checklists',
    Field('SAMPLING_EVENT_IDENTIFIER', 'string'),
    Field('LATITUDE', 'string'), #double
    Field('LONGITUDE', 'string'), #double
    Field('OBSERVATION_DATE', 'string'), #datetime
    Field('OBSERVER_ID', 'string'),
    Field('DURATION_MINUTE', 'string'), #integer
)

#db.define_table(
#    'mapLayers',
#    Field('COMMON_NAME', 'string'),
#    Field('SAMPLING_EVENT_IDENTIFIER', 'string'),
#    Field('LATITUDE', 'string'),
#    Field('LONGITUDE', 'string')
#)

#csv handler

if db(db.species).isempty():
    with open('species.csv', 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            db.species.insert(COMMON_NAME=row[0])

if db(db.sightings).isempty():
    with open('sightings.csv', 'r') as g:
        reader = csv.reader(g)
        for row in reader:
            db.sightings.insert(
                SAMPLING_EVENT_IDENTIFIER=row[0],
                COMMON_NAME=row[1],
                OBSERVATION_COUNT=row[2]
            )

if db(db.checklists).isempty():
    with open('checklists.csv', 'r') as h:
        reader = csv.reader(h)
        for row in reader:
            db.checklists.insert(
                SAMPLING_EVENT_IDENTIFIER=row[0],
                LATITUDE=row[1],
                LONGITUDE=row[2],
                OBSERVATION_DATE=row[3],
                OBSERVER_ID=row[4],
                DURATION_MINUTE=row[6]
            )

 

db.commit()

