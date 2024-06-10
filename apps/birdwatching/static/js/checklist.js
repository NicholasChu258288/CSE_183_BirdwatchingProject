"use strict";

let app = {
    data() {
        return {
            searchQuery: '',
            species: [],
            filteredSpecies: []
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
        filterspecies() {
            let query = this.searchQuery.trim().toLowerCase(); // Trim and convert search query to lowercase
            this.filteredSpecies = this.species.filter(species => 
                species.COMMON_NAME.trim().toLowerCase().startsWith(query) // Trim and convert COMMON_NAME to lowercase
            );
        },
        incrementCount(species) {
            if (!species.observationCount) {
                species.observationCount = 0;
            }
            species.observationCount += 1; // Increment the count by 1
        },
        load_data() {
            let coord1 = localStorage.getItem('coord1');
            let coord2 = localStorage.getItem('coord2');
            console.log('coord1', coord1);
            console.log('coord2', coord2);
            axios.get(get_species_url).then((response) => {
                if (response.data.error) {
                    console.error(response.data.error);
                    return;
                }
                let species_list = response.data.species_list;
                // Ignore the first entry
                let filtered_species_list = species_list.slice(1);
                filtered_species_list.forEach(species => {
                    species.observationCount = 0; // Initialize observationCount to 0
                    species.duration = 0; // Initialize duration to 0
                });
                this.species = filtered_species_list;
                this.filteredSpecies = filtered_species_list;
            }).catch(error => {
                console.error(error);
            });
        },
        submitData(species) {
            // Retrieve coord1 from local storage
            let coord1 = localStorage.getItem('coord1');
            
            // Ensure coord1 is not null or undefined
            if (!coord1) {
                console.error("No coordinates found in local storage");
                return;
            }

            // Split coord1 to get latitude and longitude
            let [latitude, longitude] = coord1.split(',');

            let checklistItem = {
                COMMON_NAME: species.COMMON_NAME,
                observationCount: species.observationCount,
                LATITUDE: latitude.trim(), // Use the extracted latitude
                LONGITUDE: longitude.trim(), // Use the extracted longitude
                DURATION_MINUTE: species.duration // Use the specified duration
            };
            
            axios.post(submit_checklist_url, checklistItem) // Sending the single item directly
                .then(response => {
                    if (response.data.success) {
                        console.log("Checklist submitted successfully");
                    } else {
                        console.error("Checklist submission failed");
                    }
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
