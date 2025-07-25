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
            speciesData: [],
            currentUserEmail: null,
        };
    },
    methods: {
        goToMyChecklists() {
            console.log("Navigating to My Checklists");
            window.location.href = '/birdwatching/my_checklists';
        },
        goToIndex() {
            window.location.href = '/birdwatching/index';
        },
        getCurrentUserEmail() {
            axios.get(get_current_user_email_url)
                .then(response => {
                    // console.log("DATA: ", response.data);
                    this.currentUserEmail = response.data;
                    // console.log("Current email: ", this.currentUserEmail);
                })
                .catch(error => {
                    console.error('Error getting current user: ', error);
                });
        },
        setMapRegion: function(lat, lng) {
            this.mapLatitude = lat;
            this.mapLongitude = lng;
        },
        filterSpecies: function() {
            this.filteredCNames = this.speciesData.filter(species => species.name.toLowerCase().includes(this.searchCName.toLowerCase()));
        },
        generateChart: function(data) {
            const ctx = document.getElementById('speciesChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.name),
                    datasets: [{
                        label: 'Number of Sightings',
                        data: data.map(d => d.count),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },
    mounted: function() {
        this.getCurrentUserEmail();
    },
};

app.vue = Vue.createApp(app.data).mount("#app");

app.init = function(s) {
    console.log('Initializing');
    console.log(s);

    if (coord1 && coord1.length == 2) {
        console.log('Changing from default starting coords\n');
        startingLat = coord1[0];
        startingLong = coord1[1];
    }

    app.vue.setMapRegion(startingLat, startingLong);
    
    app.map = L.map('map').setView([app.vue.mapLatitude, app.vue.mapLongitude], app.vue.mapZoom);
    L.tileLayer('https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=hHqg8mPc2fHoRXZlWkXl', {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(app.map);

    let i = 0;
    s.forEach(function(res) {
        if (i < 30) { // Add only up to the first 30 coords as markers to avoid issues
            L.marker(L.latLng(Number(res.LATITUDE), Number(res.LONGITUDE))).addTo(app.map);
            i++;
        }
    });

    // Prepare data for chart
    const speciesCount = s.reduce((acc, res) => {
        acc[res.COMMON_NAME] = (acc[res.COMMON_NAME] || 0) + 1;
        return acc;
    }, {});

    const speciesData = Object.keys(speciesCount).map(name => ({
        name: name,
        count: speciesCount[name]
    }));

    app.vue.speciesData = speciesData;
    app.vue.filteredCNames = speciesData;
    app.vue.generateChart(speciesData);
};

app.load_data = function() {
    axios.get(load_user_stats_url).then(function(r) {
        const userEmail = r.data.user_email;
        app.init(r.data.user_list);
    });
    
    axios.get(get_user_species_url).then(function(r) {
        console.log("results:", r);
        const speciesData = r.data.unique_species_data.map(species => ({
            name: species.name,
            count: species.count
        }));
    
        app.vue.speciesData = speciesData;
        app.vue.filteredCNames = speciesData;
        app.vue.generateChart(speciesData);
    }).catch(function(error) {
        console.error("Error loading species data:", error);
    });
    
};

app.load_data();
