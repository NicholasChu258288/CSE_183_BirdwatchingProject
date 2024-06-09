"use strict";

let app = {
    data() {
        return {
            searchQuery: '',
            sightings: [],
            filteredSightings: []
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
        filtersightings() {
            let query = this.searchQuery.trim().toLowerCase(); // Trim and convert search query to lowercase
            this.filteredSightings = this.sightings.filter(sighting => 
                sighting.COMMON_NAME.trim().toLowerCase().startsWith(query) // Trim and convert COMMON_NAME to lowercase
            );
        },
        incrementCount(sighting) {
            if (!sighting.incrementCount) {
                sighting.incrementCount = 0;
            }
            sighting.observationCount += parseInt(sighting.incrementCount);
            sighting.incrementCount = 0;
        },
        load_data() {
            let coord1 = localStorage.getItem('coord1');
            let coord2 = localStorage.getItem('coord2');
            console.log('coord1', coord1);
            console.log('coord2', coord2);
            axios.get(get_sightings_url).then((response) => {
                if (response.data.error) {
                    console.error(response.data.error);
                    return;
                }
                let sightings_list = response.data.sightings_list;
                // Ignore the first entry
                let filtered_sightings_list = sightings_list.slice(1);
                filtered_sightings_list.forEach(sighting => {
                    sighting.incrementCount = 0;
                });
                this.sightings = filtered_sightings_list;
                this.filteredSightings = filtered_sightings_list;
            }).catch(error => {
                console.error(error);
            });
        }
    },
    mounted() {
        this.load_data();
    }
};

Vue.createApp(app).mount("#app");
