"use strict";

let app = {};

let coord1 = localStorage.getItem('coord1');
let startingLat = 37.074464;
let startingLong = -121.92627;


app.user_stats = [];

app.data = {
    data: function() {
        return {
            mapLatitude: 0,
            mapLongitude: 0,
            mapZoom: 8,

            displaySuggestions: false, 
            searchCName: '',
            filteredCNames: [],
        };
    },
    methods: {
        setMapRegion: function(lat, lng){
            this.mapLatitude = lat;
            this.mapLongitude = lng;
        },
    }
}

app.vue = Vue.createApp(app.data).mount("#app");

app.init = function(s) {
    console.log('Initializing');
    console.log(s);

    if (coord1.length == 2){
        console.log('Changing from defaul starting coords\n');
        startingLat = coord1[0];
        startingLong = coord1[1];
    }

    app.vue.setMapRegion(startingLat, startingLong);
    
    app.map = L.map('map').setView([app.vue.mapLatitude, app.vue.mapLongitude], app.vue.mapZoom);
    L.tileLayer('https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=hHqg8mPc2fHoRXZlWkXl', {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
    }).addTo(app.map);

    let i = 0;
    s.forEach(function (res){
        if (i < 30){ //Add only up to the first 30 coords as markers to avoid issues
            L.marker(L.latLng(Number(res.LATITUDE), Number(res.LONGITUDE))).addTo(app.map);
            i++;
        }
    });


}

app.load_data = function() {
    axios.get(load_user_stats_url).then(function(r) {
        app.init(r.data.user_list);
    });
}

app.load_data();

