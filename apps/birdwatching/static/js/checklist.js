"use strict";

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


app.data = {    
    data: function() {
        return {
            // Complete as you see fit.
            my_value: 1,
        };
    },
    methods: {
        // Complete as you see fit.
        goToMyChecklists() {
            console.log("Pressing button");
            window.location.href = '/birdwatching/my_checklists';
        },
        goToIndex() {
            window.location.href = '/birdwatching/index';
        }
    }
};

app.vue = Vue.createApp(app.data).mount("#app");

app.load_data = function () {
    var coord1 = localStorage.getItem('coord1');
    var coord2 = localStorage.getItem('coord2');
    console.log('Loading\n');
    console.log('coord1');
    console.log(coord1);
    console.log('coord2');
    console.log(coord2);
}

app.load_data();
