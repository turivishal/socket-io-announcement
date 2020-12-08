// INITIALIZE 
let host = "http://localhost:3003";
let userId = "5f5305cab866de2978d56413";
let role = "hostsAnnouncement";

// just pass eventId only
let filters = { eventId: "5f2ccd365a66a47efdef988d" }; 

const socket = io(host, {
    path: "/chatservices",
    transports: ['websocket'],  // https://stackoverflow.com/a/52180905/8987128
    allowUpgrades: false,
    query: { userId, filters: JSON.stringify(filters) },
    reconnect: false,
    secure: true,
    rejectUnauthorized: false
});
document.getElementById("host").innerHTML = host;
document.getElementById("userId").innerHTML = userId;
document.getElementById("role").innerHTML = role;

// SEND MESSAGE
$(document).ready(function () {
    $("#frmAnnouncement").on('submit', function (event) {
        event.preventDefault();
        
        let message = $(this).find("#message").val();
        let channels = [];
        if($(this).find("#attendee").is(":checked")) channels.push("attendeeAnnouncement");
        if($(this).find("#exhibitor").is(":checked")) channels.push("exhibitorAnnouncement");
        if($(this).find("#hosts").is(":checked")) channels.push("hostsAnnouncement");
        if($(this).find("#speaker").is(":checked")) channels.push("speakerAnnouncement");
        if($(this).find("#operator").is(":checked")) channels.push("operatorAnnouncement");

        socket.emit("announcement", channels, { message: message });

        this.reset();
    });
});

socket.once("connect", () => {
    
    document.getElementById("cStatus").innerHTML = "connected";

    // GENERAL FOR ALL USERS/ROLES
    socket.on("announcement", (data) => {
        $("#announcement").append(`
            <hr>
            <div>
                <b>General</b>
                <p>${data.message}</p>
                <i>${new Date(data.createdAt)}</i>
            </div>
        `);
    });

    // PARTICULAR FOR THIS ROLE
    socket.on(role, (data) => {
        $("#announcement").append(`
            <hr>
            <div>
                <p>${data.message}</p>
                <i>${new Date(data.createdAt)}</i>
            </div>
        `);
    });
    
    // ==== SUPPORTIVES 

    socket.on("connect_error", (err) => {
        document.getElementById("cStatus").innerHTML = "Connect Error - " + err.message;
        console.log(err.message);
    });
    socket.on("connect_timeout", () => {
        document.getElementById("cStatus").innerHTML = "Conection Time Out Please Try Again.";
    });
    socket.on("reconnect", (num) => {
        document.getElementById("cStatus").innerHTML = "Reconnected - " + num;
    });
    socket.on("reconnect_attempt", () => {
        document.getElementById("cStatus").innerHTML = "Reconnect Attempted.";
    });
    socket.on("reconnecting", (num) => {
        document.getElementById("cStatus").innerHTML = "Reconnecting - " + num;
    });
    socket.on("reconnect_error", (err) => {
        document.getElementById("cStatus").innerHTML = "Reconnect Error - " + err.message;
    });
    socket.on("reconnect_failed", () => {
        document.getElementById("cStatus").innerHTML = "Reconnect Failed";
    });

});