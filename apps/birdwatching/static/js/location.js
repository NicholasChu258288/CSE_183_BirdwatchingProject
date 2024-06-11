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

            // let c1 = coord1.split(',').map(parseFloat);f


            console.log('coord1', coord1);
            console.log('coord2', coord2);
            // console.log("Fetching location data with coordinates:", c1, c2);

            // console.log("coordinate 1:",c1);
            // console.log("coordinate2:", c2);

            axios.get(location_stats_url, {
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
                let species_list = response.data.species_list;
                let top_contributors = response.data.top_contributors;
                let sightings_data = response.data.sightings_data;
                if (this.selectedSpecies) {
                    this.fetchSightingsOverTime(this.selectedSpecies.COMMON_NAME);
                } 
                this.speciesList = species_list;
                this.topContributors = top_contributors;
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
                    responsive: true, // Ensure the chart is responsive
                    maintainAspectRatio: false, // Disable the default aspect ratio
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

Vue.createApp(app).mount('#app');
