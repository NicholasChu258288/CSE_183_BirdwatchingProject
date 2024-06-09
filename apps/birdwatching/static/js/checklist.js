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
            if (!species.incrementCount) {
                species.incrementCount = 0;
            }
            species.observationCount += parseInt(species.incrementCount);
            species.incrementCount = 0;
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
                    species.incrementCount = 0;
                });
                this.species = filtered_species_list;
                this.filteredSpecies = filtered_species_list;
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
