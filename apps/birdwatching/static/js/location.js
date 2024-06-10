"use strict";

let app = {
    data() {
        return {
            speciesList: [],
            topContributors: [],
            selectedSpecies: null,
            chart: null // Add a property to hold the chart instance
        };
    },
    methods: {
        fetchLocationData() {
            let coord1 = localStorage.getItem('coord1');
            let coord2 = localStorage.getItem('coord2');

            console.log('coord1', coord1);
            console.log('coord2', coord2);
            console.log("Fetching location data with coordinates:", coord1, coord2);

            axios.get(get_species_url, {
                params: {
                    coord1: coord1,
                    coord2: coord2
                }
            }).then(response => {
                if (response.data.error) {
                    console.error("Error:", response.data.error);
                    return;
                }
                console.log("Location data received:", response.data);
                this.speciesList = response.data.species_list;
                this.topContributors = response.data.top_contributors;
            }).catch(error => {
                console.error("Error fetching location data:", error);
            });
        },
        selectSpecies(species) {
            this.selectedSpecies = species;
            this.fetchSightingsOverTime(species.COMMON_NAME);
        },
        fetchSightingsOverTime(speciesName) {
            console.log("Fetching sightings over time for species:", speciesName);
            axios.get(get_sightings_over_time_url, {
                params: { species: speciesName }
            }).then(response => {
                console.log("Sightings data received:", response.data);
                this.renderChart(response.data);
            }).catch(error => {
                console.error("Error fetching sightings data:", error);
            });
        },
        renderChart(data) {
            const ctx = document.getElementById('sightingsChart').getContext('2d');
            // Destroy the existing chart instance if it exists
            if (this.chart) {
                this.chart.destroy();
            }
            // Create a new chart instance
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.dates,
                    datasets: [{
                        label: 'Sightings Over Time',
                        data: data.counts,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        x: { title: { display: true, text: 'Date' }},
                        y: { title: { display: true, text: 'Count' }}
                    }
                }
            });
        },
        goToIndex() {
            window.location.href = '/birdwatching/index';
        }
    },
    mounted() {
        this.fetchLocationData();
    }
};


app.filterSightingsByRegion = function () {
    let coord1 = JSON.parse(localStorage.getItem('coord1'));
    let coord2 = JSON.parse(localStorage.getItem('coord2'));

    // Filter species within the defined region
    let filtered_species_data = app.species_data.filter(species => {
        return app.sightings_reference[species.COMMON_NAME].some(coord => {
            return (coord[0] >= Math.min(coord1[0], coord2[0]) && coord[0] <= Math.max(coord1[0], coord2[0]) &&
                coord[1] >= Math.min(coord1[1], coord2[1]) && coord[1] <= Math.max(coord1[1], coord2[1]));
        });
    });

    // Map the filtered species to get their common names
    app.selected_species = filtered_species_data.map(species => species.COMMON_NAME);

    // Filter sightings, checklists, and map data based on the selected species
    app.sightings_data = app.sightings_data.filter(sighting => app.selected_species.includes(sighting.COMMON_NAME));
    app.checklist_data = app.checklist_data.filter(checklist => {
        return (checklist.LATITUDE >= Math.min(coord1[0], coord2[0]) && checklist.LATITUDE <= Math.max(coord1[0], coord2[0]) &&
            checklist.LONGITUDE >= Math.min(coord1[1], coord2[1]) && checklist.LONGITUDE <= Math.max(coord1[1], coord2[1]));
    });
    app.map_data = app.map_data.filter(mapEntry => app.selected_species.includes(mapEntry.COMMON_NAME));

    // Assign the new filtered data
    app.species_data = filtered_species_data;

    console.log("Filtered species data:", app.species_data);
    console.log("Filtered sightings data:", app.sightings_data);
    console.log("Filtered checklist data:", app.checklist_data);
    console.log("Filtered map data:", app.map_data);
    console.log("Selected species within region:", app.selected_species);
};


Vue.createApp(app).mount('#app');
