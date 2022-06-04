const express = require("express");
const path = require("path");
var app = express();
var server = app.listen(4000, function() {
    console.log("Listening on port 4000");
});
const fs = require("fs");
const io = require("socket.io")(server, {
    allowEIO3: true, // false by default
});
app.use(express.static(path.join(__dirname, "")));
var userConnections = [];
io.on("connection", (socket) => {
    console.log("Socket Id is", socket.id);
    socket.on("userconnect", (data) => {
        console.log("userconnent", data.displayName, data.meetingid);
        var other_users = userConnections.filter(
            (p) => p.meeting_id == data.meetingid
        );
        userConnections.push({
            connectionId: socket.id,
            user_id: data.displayName,
            meeting_id: data.meetingid,
        });
        var userCount = userConnections.length;
        console.log(userCount);
        other_users.forEach((v) => {
            socket.to(v.connectionId).emit("inform_others_about_me", {
                other_user_id: data.displayName,
                connId: socket.id,
                userNumber: userCount,
            });
        });
        socket.emit("inform_me_about_other_user", other_users);
    });
    //Informing me of other Users
    socket.on("SDPProcess", (data) => {
        socket.to(data.to_connid).emit("SDPProcess", {
            message: data.message,
            from_connid: socket.id,
        });
        //Here we are sending our data to other users. For creating connection
        //Letting other users to know about me
    });
    //We are connecting the server with client through socket.id server->index.html(ajax/socket.io)->app.js(socket.io)
    socket.on("sendMessage", (msg) => {
        console.log(msg);
        var mUser = userConnections.find((p) => p.connectionId == socket.id);
        if (mUser) {
            var meetingid = mUser.meeting_id;
            var from = mUser.user_id;
            var list = userConnections.filter((p) => p.meeting_id == meetingid);
            list.forEach((v) => {
                socket.to(v.connectionId).emit("showChatMessage", {
                    from: from,
                    message: msg,
                });
            });
        }
    });
    socket.on("disconnect", function() {
        console.log("Disconnected");
        var disUser = userConnections.find((p) => p.connectionId == socket.id);
        if (disUser) {
            var meetingid = disUser.meeting_id;
            userConnections = userConnections.filter(
                (p) => p.connectionId != socket.id
            );
            var list = userConnections.filter((p) => p.meeting_id == meetingid);
            list.forEach((v) => {
                var userNumberAfUserLeave = userConnections.length;
                socket.to(v.connectionId).emit("inform_other_about_disconnected_user", {
                    connId: socket.id,
                    uNumber: userNumberAfUserLeave,
                });
            });
        }
    });
});