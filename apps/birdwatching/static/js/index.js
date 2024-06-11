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

app.existingHeatMaps = [];
app.heatMapCoords = [];

var heat;

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
            if (newRectangle == 2){
                localStorage.setItem('coord1', [app.drawing_coords[0].lat, app.drawing_coords[0].lng]);
                localStorage.setItem('coord2', [app.drawing_coords[1].lat, app.drawing_coords[1].lng]);
                window.location.href = '/birdwatching/checklist';
            } else {
                //Setting arbitray default coords to prevent possible issues later
                localStorage.setItem('coord1', [37.074464, -121.92627]);
                localStorage.setItem('coord2', [38.000000, -120.00000]);
                console.log('Please select a region!');
                alert('Select a region');
            }
        },

        enterLocation() {
            console.log('Location button clicked');
            if (newRectangle == 2){
                localStorage.setItem('coord1', [app.drawing_coords[0].lat, app.drawing_coords[0].lng]);
                localStorage.setItem('coord2', [app.drawing_coords[1].lat, app.drawing_coords[1].lng]);
                window.location.href = '/birdwatching/location';
            } else {
                //Setting arbitray default coords to prevent possible issues later
                localStorage.setItem('coord1', [37.074464, -121.92627]);
                localStorage.setItem('coord2', [38.000000, -120.00000]);
                console.log('Please select a region!');
                alert('Select a region');
            }
        },
        

        setSpeciesCommonNames: function(species_list){
            let self = this;
            species_list.forEach(function(s){
                self.speciesCNames.push(s.COMMON_NAME);
            });
        },
        addSpeicesCommonName: function(common_name){
            let self = this;
            self.speciesCNames.push(common_name);
        },
        setSelectedSpecies: function(selectedSpeciesList){
            let self = this;
            selectedSpeciesList.forEach(function(s){
                self.selectedCNames.push(s);
            });
        },
        filterCommonNames: function(){
            let limit_display = true;
            if (limit_display){}
            this.filteredCNames = this.speciesCNames.filter( cName => {
                return cName.toString().toLowerCase().includes(this.searchCName.toString().toLowerCase());
            });
            if (limit_display == true){
                let tmp = [];
                let max = 8; //Max number of species displayed
                this.filteredCNames.forEach( function(r) {
                    if (max != 0){
                        tmp.push(r);
                        max --;
                    }
                });
                this.filteredCNames = tmp;

            }
        },
        setSeachCName: function(setName){
            this.searchCName = setName;
            this.displaySuggestions = false;
        },
        editSelectedSpecies: function(cName){
            //console.log("Selected: ", cName, "\n");
            if (this.selectedCNames.includes(cName)){
                console.log("Already in selected list\n");
            } else {
                //console.log("DNE so can push to list");
                this.selectedCNames.push(cName);
                //console.log(this.selectedCNames);
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
    if (app.existingHeatMaps.toString() != app.selected_species.toString()){
        console.log('Need to create new heatMap');
        app.map.removeLayer(heat);

        app.existingHeatMaps = [];
        app.heatMapCoords = [];
    
        app.selected_species.forEach(function (i){
            app.existingHeatMaps.push(i);
        });

        app.existingHeatMaps.forEach(function (i){
            app.heatMapCoords = app.heatMapCoords.concat(app.sightings_reference[i]);
        });

        heat = L.heatLayer(app.heatMapCoords).addTo(app.map);
    } else {
        console.log('No need to update heatmap');
    }

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

    heat = L.heatLayer(app.heatMapCoords).addTo(app.map);

    //Set up layers
    popup = L.popup()
    .setLatLng([startingLat, startingLong])
    .setContent("Select a region by drawing a rectangle, done through clicking two points on the map.")
    .openOn(app.map);

    //Listeners
    app.map.on('click', mapClick); //Should just point location
    app.map.on('click', app.click_listener); //Click test
    app.map.on('mouseover', app.heatMap_listener);
}

app.load_data = function () {
    axios.get(load_data_url).then( function (r){
        
        let s = r.data.species_list;
        let i = 0;
        
        s.forEach(function(res){
           //Just skip first element 
            if (i != 0){
                app.species_data.push(res);
                app.sightings_reference[res.COMMON_NAME] = [];
                app.vue.addSpeicesCommonName(res.COMMON_NAME);
            } else {
                i++;
            }
            
        });

        let m = r.data.map_list;
        let map_data_size = 0;
    
        m.forEach(function(res){
            app.map_data.push(res);
            if (map_data_size > 0){
                app.sightings_reference[res.sightings.COMMON_NAME].push([Number(res.checklists.LATITUDE), Number(res.checklists.LONGITUDE)]);
                app.heatMapCoords.push([res.checklists.LATITUDE, res.checklists.LONGITUDE]);
            } else {
                console.log(res);
            }
            map_data_size+=1;
        });
        
       app.init();
    });
}

app.load_data();


