// layout.js

"use strict";

let layoutApp = {
    methods: {
        goToUserStats() {
            window.location.href = '/birdwatching/user_stats';
        },
    }
};

// Mounting app for the navbar
let navbarApp = Vue.createApp(layoutApp);
navbarApp.mount(".navbar");  // Assuming the navbar has the class "navbar"
