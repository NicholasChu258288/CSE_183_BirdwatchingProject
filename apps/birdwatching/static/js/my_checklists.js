"use strict";

let app = {
    data() {
        return {
        };
    },
    methods: {
        goToChecklists() {
            console.log("Navigating to My Checklists");
            window.location.href = '/birdwatching/checklist';
        },
        goToIndex() {
            window.location.href = '/birdwatching/index';
        },
    }

};

Vue.createApp(app).mount("#app");
