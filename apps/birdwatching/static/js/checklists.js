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
        }
    }
};

app.vue = Vue.createApp(app.data).mount("#checklist_app");

app.load_data = function () {

}

app.load_data();