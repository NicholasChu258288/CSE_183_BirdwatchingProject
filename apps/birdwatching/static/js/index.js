"use strict";


// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


//Global variables used for maps
//Default region
let startingLat = 37.074464;
let startingLong = -121.92627;

//Map listener functions
var popup = L.popup;
let newRectangle = 0; 
app.drawing_coords = [];
app.rectangle = [];
app.species_names = [];

app.species_data = [];
app.sightings_data = [];
app.checklist_data = [];
app.map_data = [];

app.selected_species = [];

app.sightings_reference = {};// SpeciesName: {sampling events}

app.data = {    
    data: function() {
        return {
            // Complete as you see fit.
            mapLatitude: 0,
            mapLongitude: 0,
            mapZoom: 8,
            speciesCNames: [],
            selectedCNames: [],
            
            displaySuggestions: false, 
            searchCName: '',
            filteredCNames: [],
        };
    },
    methods: {
        // Complete as you see fit.
        setMapRegion: function(latitude, longitude){
            this.mapLatitude = latitude;
            this.mapLongitude = longitude;
        },
        enterChecklist() {
            window.location.href = '/birdwatching/checklist';
        },
        setSpeciesCommonNames: function(species_list){
            let self = this;
            species_list.forEach(function(s){
                self.speciesCNames.push(s.COMMON_NAME);
            });
        },
        addSpeicesCommonName: function(common_name){
            let self = this;
            self.speciesCNames.push(common_name.toLowerCase());
        },
        setSelectedSpecies: function(selectedSpeciesList){
            let self = this;
            selectedSpeciesList.forEach(function(s){
                self.selectedCNames.push(s);
            });
        },
        filterCommonNames: function(){
            //console.log("Filtering by name:", this.searchCName);
            this.filteredCNames = this.speciesCNames.filter( cName => {
                return cName.toString().toLowerCase().startsWith(this.searchCName.toString().toLowerCase());
            });
        },
        setSeachCName: function(setName){
            this.searchCName = setName;
            this.displaySuggestions = false;
        },
        editSelectedSpecies: function(cName){
            console.log("Selected: ", cName, "\n");
            if (this.selectedCNames.includes(cName)){
                console.log("Removed from already selected list\n");
                let tmp = [];
                this.selectedCNames.forEach(function(s){
                    if (s != cName){
                        tmp.push(s);
                    }
                });
                this.selectedCNames = tmp;
                console.log(this.selectedCNames);
            } else {
                console.log("DNE so can push to list");
                this.selectedCNames.push(cName);
                console.log(this.selectedCNames);
            }
            app.selected_species = this.selectedCNames;
        },
        deleteSelectedSpecies: function(cName){
            let tmp = [];
            this.selectedCNames.forEach(function(s){
                if (s != cName){
                    tmp.push(s);
                }
            });
            this.selectedCNames = tmp;
            app.selected_species = this.selectedCNames;
        },

    }
};


function mapClick(e){
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(app.map);
    console.log('Map clicked, printing selected species: ');
    console.log(app.selected_species);
}

app.click_listener = function (e) {
        // If we are drawing, it's one more point for our polygon.
        if (newRectangle == 2){
            app.rectangle.forEach(function(r){
                app.map.removeLayer(r);
            });
            app.map.removeLayer(app.rectangle);
            app.drawing_coords = [];
            newRectangle = 0;
        }
        app.drawing_coords.push(e.latlng);
        newRectangle += 1;
        if (newRectangle == 2){
            var r = L.rectangle(app.drawing_coords, {color: 'red'}).addTo(app.map);
            app.rectangle.push(r);
            console.log('Coord 1:', app.drawing_coords[0].lat, app.drawing_coords[0].lng);
            console.log('Coord 2:', app.drawing_coords[1].lat, app.drawing_coords[1].lng);
        }
};

app.heatMap_listener = function(e) {
    let s = app.vue.selectedSpeciesList;
}

//Create the map
app.vue = Vue.createApp(app.data).mount("#app");

//Initializing map
app.init = () => {
    
    
    app.vue.setMapRegion(startingLat,startingLong);

    app.map = L.map('map').setView([app.vue.mapLatitude, app.vue.mapLongitude], app.vue.mapZoom);
    L.tileLayer('https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=hHqg8mPc2fHoRXZlWkXl', {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
    }).addTo(app.map);

    console.log("initializing");
    
    //L.marker(L.latLng(37.094464, -122)).addTo(app.map);
    
    /*
    var overlayMaps = {};
    var layerElement = [];

    let once = true;

    for (const [key, value] of Object.entries(app.sightings_reference)){
        //key is COMMON_NAME
        //value is [lat, long]
        //console.log("This is the key:", key)
        //console.log("This is the value:", value)
        //var popupMessage = "Common name:" + key;
        layerElement = [];
        var i = 0;
        value.forEach(function (res){
            
            //let lat = 0;
            //let long = 0;
            //lat += res[0];
            //long += res[1];


            //console.log(typeof(lat));
            
            //console.log(typeof(long));
            
            
            if (once == true){
                console.log('addedMarker:', key)
                console.log(res[0]);
                console.log(res[1]);
                L.marker(L.latLng(res[0], res[1])).addTo(app.map);
                once = false;
            }
            //layerElement.push(coords);
        });

        //var species = L.layerGroup(layerElement);
        //overlayMaps[key] = species; 
    }
    */

    //L.control.layers(overlayMaps).addTo(app.map);
    

    //Set up layers
    popup = L.popup()
    .setLatLng([startingLat, startingLong])
    .setContent("Select a region by drawing a rectangle, done through clicking two points on the map.")
    .openOn(app.map);

    //Listeners
    app.map.on('click', mapClick); //Should just point location
    app.map.on('click', app.click_listener); //Click test
    //console.log('Done initializing');
    //console.log(app.sightings_reference);
}

app.load_data = function () {
    axios.get(load_data_url).then( function (r){
        
        let s = r.data.species_list;
        let i = 0;
        //console.log('Setting up species list');
        s.forEach(function(res){
            /*if (i < 2){
                console.log(res);
                i++;
            }*/
           //Just skip first
            if (i != 0){
                app.species_data.push(res);
                app.sightings_reference[res.COMMON_NAME] = [];
                app.vue.addSpeicesCommonName(res.COMMON_NAME);
            } else {
                i++;
            }
            
        });
        //console.log('Finished setting up');
        
        /*
        let si = r.data.sightings_list;
        si.forEach(function(res){
            app.sightings_data.push(res);
        });

        let c = r.data.checklist_list;
        c.forEach(function(res){
           app.checklist_data.push(res);
        })
        */

        let m = r.data.map_list;
        let map_data_size = 0;
        //console.log("Creating list");
        m.forEach(function(res){
            app.map_data.push(res);
            //app.sightings_reference[res.sightings.COMMON_NAME].push([parseFloat(res.checklists.LATITUDE), parseFloat(res.checklists.LONGITUDE)]);

            if (map_data_size > 0){
                app.sightings_reference[res.sightings.COMMON_NAME].push([Number(res.checklists.LATITUDE), Number(res.checklists.LONGITUDE)]);
            } else {
                console.log(res);
            }
            map_data_size+=1;
            //app.sightings_reference[res.sightings.COMMON_NAME].push([res.checklists.LATITUDE, res.checklists.LONGITUDE]);
        });
        //console.log("Finished list");

       app.init();
    });
}


app.load_data();
//app.init();


