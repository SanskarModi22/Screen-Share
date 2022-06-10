var AppProcess = (function() {
    var serverProcess;
    var peers_connection_ids = [];
    var peers_connection = [];
    var remote_vid_stream = [];
    var remote_aud_stream = [];
    var local_div;
    var local_div_Mob;
    var serverProcess;
    var audio;
    var isAudioMute = true;
    var rtp_aud_senders = [];
    var video_states = {
        None: 0,
        Camera: 1,
        ScreenShare: 2,
    };
    var video_st = video_states.None;
    var videoCamTrack;
    var rtp_vid_senders = [];
    async function init(SDP_function, my_connid) {
        serverProcess = SDP_function;
        my_connection_id = my_connid;
        eventProcess();
        local_div = document.getElementById("locaVideoPlayer");
        local_div_Mob = document.getElementById("locaVideoPlayerMob");
    }

    function eventProcess() {
        $("#micMuteUnmute").on("click", async function() {
            if (!audio) {
                await loadAudio();
            }
            if (!audio) {
                alert("Audio permission has not granted");
                return;
            }
            if (isAudioMute) {
                audio.enabled = true;
                $(this).html(
                    "<span class='material-icons screen-icon' style='width:100%;'>mic</span>"
                );
                updateMediaSenders(audio, rtp_aud_senders);
            } else {
                audio.enabled = false;
                $(this).html(
                    "<span class='material-icons screen-icon' style='width:100%;'>mic_off</span>"
                );
                removeMediaSenders(rtp_aud_senders);
            }
            isAudioMute = !isAudioMute;
        });
        $("#miceMuteUnmute").on("click", async function() {
            if (!audio) {
                await loadAudio();
            }
            if (!audio) {
                alert("Audio permission has not granted");
                return;
            }
            if (isAudioMute) {
                audio.enabled = true;
                $(this).html(
                    "<span class='material-icons screen-icon' style='width:100%;'>mic</span>"
                );
                updateMediaSenders(audio, rtp_aud_senders);
            } else {
                audio.enabled = false;
                $(this).html(
                    "<span class='material-icons screen-icon' style='width:100%;'>mic_off</span>"
                );
                removeMediaSenders(rtp_aud_senders);
            }
            isAudioMute = !isAudioMute;
        });
        $("#videoCamOnOff").on("click", async function() {
            if (video_st == video_states.Camera) {
                await videoProcess(video_states.None);
            } else {
                await videoProcess(video_states.Camera);
            }
        });
        $("#ScreenShareOnOf").on("click", async function() {
            if (video_st == video_states.ScreenShare) {
                await videoProcess(video_states.None);
            } else {
                await videoProcess(video_states.ScreenShare);
            }
        });
        $("#ScreenShareOnOfMob").on("click", async function() {
            if (video_st == video_states.ScreenShare) {
                await videoProcess(video_states.None);
            } else {
                await videoProcess(video_states.ScreenShare);
            }
        });
    }
    async function loadAudio() {
        try {
            var astream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true,
            });
            audio = astream.getAudioTracks()[0];
            audio.enabled = false;
        } catch (e) {
            console.log(e);
        }
    }
    async function videoProcess(newVideoState) {
        if (newVideoState == video_states.None) {
            $("#videoCamOnOff").html(
                "<span class='material-icons' style='width:100%;'>videocam_off</span>"
            );
            // $("#stop-screen-sharing").hide();
            // $("#ScreenShareOnOf").html(
            //     '<span class="material-icons">present_to_all</span><div>Present Now</div>'
            // );
            video_st = newVideoState;

            removeVideoStream(rtp_vid_senders);
            return;
        }
        if (newVideoState == video_states.Camera) {
            $("#videoCamOnOff").html(
                "<span class='material-icons' style='width:100%;'>videocam_on</span>"
            );
        }
        try {
            var vstream = null;
            if (newVideoState == video_states.Camera) {
                vstream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: 1920,
                        height: 1080,
                    },
                    audio: false,
                });
            } else if (newVideoState == video_states.ScreenShare) {
                vstream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        width: 1920,
                        height: 1080,
                    },
                    audio: false,
                });
                vstream.oninactive = (e) => {
                    removeVideoStream(rtp_vid_senders);
                    $("#ScreenShareOnOf").html(
                        '<span class="material-icons screen-icon" style="width: 100%;">videocam_off</span>'
                    );
                    $("#ScreenShareOnOfMob").html(
                        '<span class="material-icons screen-icon" style="width: 100%;">videocam_off</span>'
                    );
                    // $("#stop-screen-sharing").hide();
                };
            }
            if (vstream && vstream.getVideoTracks().length > 0) {
                videoCamTrack = vstream.getVideoTracks()[0];
                if (videoCamTrack) {
                    local_div.srcObject = new MediaStream([videoCamTrack]);
                    local_div_Mob.srcObject = new MediaStream([videoCamTrack]);
                    updateMediaSenders(videoCamTrack, rtp_vid_senders);
                }
            }
        } catch (e) {
            console.log(e);
            return;
        }
        video_st = newVideoState;
        if (newVideoState == video_states.Camera) {
            $("#videoCamOnOff").html(
                '<span class="material-icons screen-icon" style="width: 100%;">videocam</span>'
            );
            $("#ScreenShareOnOf").html(
                '<span class="material-icons screen-icon" style="width: 100%;">videocam</span>'
            );
            $("#ScreenShareOnOfMob").html(
                '<span class="material-icons screen-icon" style="width: 100%;">videocam</span>'
            );
        } else if (newVideoState == video_states.ScreenShare) {
            $("#videoCamOnOff").html(
                '<span class="material-icons screen-icon" style="width: 100%;">videocam_off</span>'
            );
            $("#ScreenShareOnOf").html(
                '<span class="material-icons screen-icon" style="width: 100%;">videocam</span>'
            );
            $("#ScreenShareOnOfMob").html(
                '<span class="material-icons screen-icon" style="width: 100%;">videocam</span>'
            );
            // $("#stop-screen-sharing").show();
        }
    }

    function connection_status(connection) {
        if (
            connection &&
            (connection.connectionState == "new" ||
                connection.connectionState == "connecting" ||
                connection.connectionState == "connected")
        ) {
            return true;
        } else {
            return false;
        }
    }
    async function updateMediaSenders(track, rtp_senders) {
        for (var con_id in peers_connection_ids) {
            if (connection_status(peers_connection[con_id])) {
                if (rtp_senders[con_id] && rtp_senders[con_id].track) {
                    rtp_senders[con_id].replaceTrack(track);
                } else {
                    rtp_senders[con_id] = peers_connection[con_id].addTrack(track);
                }
            }
        }
    }

    function removeMediaSenders(rtp_senders) {
        for (var con_id in peers_connection_ids) {
            if (rtp_senders[con_id] && connection_status(peers_connection[con_id])) {
                peers_connection[con_id].removeTrack(rtp_senders[con_id]);
                rtp_senders[con_id] = null;
            }
        }
    }

    function removeVideoStream(rtp_vid_senders) {
        if (videoCamTrack) {
            videoCamTrack.stop();
            videoCamTrack = null;
            local_div.srcObject = null;
            local_div_Mob.srcObject = null;
            removeMediaSenders(rtp_vid_senders);
        }
    }
    // ********************************iceConfiguration*****************
    var iceConfiguration = {
        iceServers: [{
                urls: "stun:stun.l.google.com:19302",
            },
            {
                urls: "stun:stun1.l.google.com:19302",
            },
        ],
    };
    // user information like network IP address, computers, users information will be stored in this
    // Information will be will be accessed by this particular connection object.

    // ************************************SET OFFER**************************************
    //We are sending offer for a webconnection through webRTC through SDP Processes.For this we have creted setOffer and SDP Process connection.
    //We are sending the offer in form of message and our connection id.
    async function setConnection(connid) {
        var connection = new RTCPeerConnection(iceConfiguration);

        connection.onnegotiationneeded = async function(event) {
            await setOffer(connid);
        };
        connection.onicecandidate = function(event) {
            if (event.candidate) {
                serverProcess(
                    JSON.stringify({ icecandidate: event.candidate }),
                    connid
                );
            }
        };
        connection.ontrack = function(event) {
            if (!remote_vid_stream[connid]) {
                remote_vid_stream[connid] = new MediaStream();
            }
            if (!remote_aud_stream[connid]) {
                remote_aud_stream[connid] = new MediaStream();
            }

            if (event.track.kind == "video") {
                remote_vid_stream[connid]
                    .getVideoTracks()
                    .forEach((t) => remote_vid_stream[connid].removeTrack(t));
                remote_vid_stream[connid].addTrack(event.track);
                var remoteVideoPlayer = document.getElementById("v_" + connid);
                remoteVideoPlayer.srcObject = null;
                remoteVideoPlayer.srcObject = remote_vid_stream[connid];
                remoteVideoPlayer.load();
            } else if (event.track.kind == "audio") {
                remote_aud_stream[connid]
                    .getAudioTracks()
                    .forEach((t) => remote_aud_stream[connid].removeTrack(t));
                remote_aud_stream[connid].addTrack(event.track);
                var remoteAudioPlayer = document.getElementById("a_" + connid);
                remoteAudioPlayer.srcObject = null;
                remoteAudioPlayer.srcObject = remote_aud_stream[connid];
                remoteAudioPlayer.load();
            }
        };
        peers_connection_ids[connid] = connid;
        peers_connection[connid] = connection;
        if (
            video_st == video_states.Camera ||
            video_st == video_states.ScreenShare
        ) {
            if (videoCamTrack) {
                updateMediaSenders(videoCamTrack, rtp_vid_senders);
            }
        }
        return connection;
    }
    async function setOffer(connid) {
        var connection = peers_connection[connid];
        var offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        serverProcess(
            JSON.stringify({
                offer: connection.localDescription,
            }),
            connid
        );
    }
    async function SDPProcess(message, from_connid) {
        message = JSON.parse(message);
        if (message.answer) {
            //If the message contains an answer for connection
            await peers_connection[from_connid].setRemoteDescription(
                new RTCSessionDescription(message.answer)
            );
        } else if (message.offer) {
            //If the message conatins an offer for connection
            if (!peers_connection[from_connid]) {
                await setConnection(from_connid);
            }
            await peers_connection[from_connid].setRemoteDescription(
                new RTCSessionDescription(message.offer)
            );
            var answer = await peers_connection[from_connid].createAnswer();
            await peers_connection[from_connid].setLocalDescription(answer);
            serverProcess(
                JSON.stringify({
                    answer: answer,
                }),
                from_connid
            );
        } else if (message.icecandidate) {
            if (!peers_connection[from_connid]) {
                await setConnection(from_connid);
            }
            try {
                await peers_connection[from_connid].addIceCandidate(
                    message.icecandidate
                );
            } catch (e) {
                console.log(e);
            }
        }
    }
    async function closeConnection(connid) {
        peers_connection_ids[connid] = null;
        if (peers_connection[connid]) {
            peers_connection[connid].close();
            peers_connection[connid] = null;
        }
        if (remote_aud_stream[connid]) {
            remote_aud_stream[connid].getTracks().forEach((t) => {
                if (t.stop) t.stop();
            });
            remote_aud_stream[connid] = null;
        }
        if (remote_vid_stream[connid]) {
            remote_vid_stream[connid].getTracks().forEach((t) => {
                if (t.stop) t.stop();
            });
            remote_vid_stream[connid] = null;
        }
    }
    //Sending offer for coonection to server
    return {
        setNewConnection: async function(connid) {
            await setConnection(connid);
        },
        init: async function(SDP_function, my_connid) {
            await init(SDP_function, my_connid);
        },
        processClientFunc: async function(data, from_connid) {
            await SDPProcess(data, from_connid);
        },
        closeConnectionCall: async function(connid) {
            await closeConnection(connid);
        },
    };
    //Setting up WebRTC connection
})();
var MyApp = (function() {
    var socket = null;
    var user_id = "";
    var meeting_id = "";
    var allUsers = [];

    function init(uid, mid) {
        user_id = uid;
        meeting_id = mid;
        $("#meetingContainer").show();
        $("#me h2").text(user_id + "(Me)");
        $("#MobmeetingContainer").show();
        $("#meMob h2").text(user_id + "(Me)");
        // document.title = user_id;
        // const urlParams = new URLSearchParams(window.location.search);
        // var meeting_id = urlParams.get("meetingID");
        // var meetingUrl =
        //     window.location.origin + "/join" + "?meetingID=" + meeting_id;
        // $(".meeting_url").text(meetingUrl);
        event_process_for_signaling_server();
        eventHandeling();
    }

    function event_process_for_signaling_server() {
        socket = io.connect();

        var SDP_function = function(data, to_connid) {
            socket.emit("SDPProcess", {
                message: data,
                to_connid: to_connid,
            });
        };
        socket.on("connect", () => {
            if (socket.connected) {
                AppProcess.init(SDP_function, socket.id);
                if (user_id != "" && meeting_id != "") {
                    socket.emit("userconnect", {
                        displayName: user_id,
                        meetingid: meeting_id,
                    });
                }
                //After socket connection our info will be sent to the server
            }
        });
        socket.on("inform_other_about_disconnected_user", function(data) {
            $("#" + data.connId).remove();
            $(".participant-count").text(data.uNumber);
            $("#participant_" + data.connId + "").remove();
            AppProcess.closeConnectionCall(data.connId);
        });
        socket.on("inform_others_about_me", function(data) {
            addUser(data.other_user_id, data.connId, data.userNumber);
            AppProcess.setNewConnection(data.connId);
        });
        socket.on("inform_me_about_other_user", function(other_users) {
            var userNumber = other_users.length;
            var userNumb = userNumber + 1;
            if (other_users) {
                for (var i = 0; i < other_users.length; i++) {
                    allUsers.push(other_users[i].connectionId);
                    addUser(
                        other_users[i].user_id,
                        other_users[i].connectionId,
                        userNumb
                    );
                    AppProcess.setNewConnection(other_users[i].connectionId);
                }
            }
        });
        //This will let me know bout other users on my page and will allow them to join my room
        socket.on("SDPProcess", async function(data) {
            await AppProcess.processClientFunc(data.message, data.from_connid);
        });
        //We are sending our data to others in the same room we have joined
        socket.on("showChatMessage", function(data) {
            var time = new Date();
            var lTime = time.toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            });
            var div = $("<div>").html(
                "<span class='font-weight-bold mr-3' style='color:black'>" +
                data.from +
                "</span>" +
                lTime +
                "</br>" +
                data.message
            );
            $("#messages").append(div);
        });
    }

    function eventHandeling() {
        $("#btnsend").on("click", function() {
            var msgData = $("#msgbox").val();
            socket.emit("sendMessage", msgData);
            var time = new Date();
            var lTime = time.toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            });
            var div = $("<div>").html(
                "<span class='font-weight-bold mr-3' style='color:black'>" +
                user_id +
                "</span>" +
                lTime +
                "</br>" +
                msgData
            );
            $("#messages").append(div);
            $("#msgbox").val("");
        });
        $(".in-call-wrap-up").on(
            "click",
            ".participant-action-wrap .participant-action-pin span",
            function() {
                var elmId = $(this).attr("id");
                $("video").addClass("video-size");
                if (elmId != "localPin") var subStr = elmId.substring(4);
                else subStr = "locaVideoPlayer";
                // alert(subStr);
                $("#me").hide();
                for (var i = 0; i < allUsers.length; i++) {
                    $("#" + allUsers[i]).hide();
                    // alert(allUsers[i]);
                }
                if (subStr != "locaVideoPlayer") {
                    $("#" + subStr).show();
                    $("#pin_" + subStr).html(
                        '<img src="../public/images/unpin.png"  id="' + elmId + '"/>'
                    );
                } else {
                    $("#me").show();
                    $("#localPin").html(
                        '<img src="../public/images/unpin.png"  id="localPin"/>'
                    );
                }
                $("#stop-screen-sharing").show();
            }
        );
        $("#divUsers").on("dblclick", "video", function() {
            $(this).addClass("video-size");
            var elmId = $(this).attr("id");
            if (elmId != "locaVideoPlayer") var subStr = elmId.substring(2);
            else subStr = "locaVideoPlayer";
            // alert(subStr);
            $("#me").hide();
            for (var i = 0; i < allUsers.length; i++) {
                if (allUsers[i] != subStr) {
                    $("#" + allUsers[i]).hide();
                    // alert(allUsers[i]);
                }
            }
            if (subStr != "locaVideoPlayer") {
                $("#" + subStr).show();
                $("#pin_" + subStr).html(
                    '<img src="../public/images/unpin.png"  id="' + elmId + '"/>'
                );
            } else {
                $("#me").show();
                $("#localPin").html(
                    '<img src="../public/images/unpin.png"  id="localPin"/>'
                );
            }
            $("#stop-screen-sharing").show();
        });
        $("#divUsersMob").on("click", "video", function() {
            $(this).addClass("video-size-Mob");
            console.log("hello");
            var elmId = $(this).attr("id");
            if (elmId != "locaVideoPlayerMob") var subStr = elmId.substring(2);
            else subStr = "locaVideoPlayerMob";
            // alert(subStr);
            $("#meMob").hide();
            for (var i = 0; i < allUsers.length; i++) {
                if (allUsers[i] != subStr) {
                    $("#" + allUsers[i] + "Mob").hide();
                    // alert(allUsers[i]);
                }
            }
            if (subStr != "locaVideoPlayerMob") {
                $("#" + subStr).show();
                $("#pin_" + subStr).html(
                    '<img src="../public/images/unpin.png"  id="' + elmId + '"/>'
                );
            } else {
                $("#meMob").show();
                $("#localPin").html(
                    '<img src="../public/images/unpin.png"  id="localPin"/>'
                );
            }
            $("#stop-screen-sharing-Mob").show();
        });
        $("#stop-screen-sharing").on("click", function() {
            $("#me video").removeClass("video-size");
            $("#me").show();
            $("#localPin").html(
                '<span class="material-icons" id="localPin"> push_pin </span>'
            );
            for (var i = 0; i < allUsers.length; i++) {
                $("video").removeClass("video-size");
                $("#" + allUsers[i]).show();
                $("#pin_" + allUsers[i]).html(
                    '<span class="material-icons" id="pin_' +
                    allUsers[i] +
                    '"> push_pin </span>'
                );
                // alert(allUsers[i]);
            }
            $("#stop-screen-sharing").hide();
        });
        $("#stop-screen-sharing-Mob").on("click", function() {
            $("#meMob video").removeClass("video-size-Mob");
            $("#meMob").show();
            $("#localPin").html(
                '<span class="material-icons" id="localPin"> push_pin </span>'
            );
            for (var i = 0; i < allUsers.length; i++) {
                $("video").removeClass("video-size-Mob");
                $("#" + allUsers[i] + "Mob").show();
                $("#pin_" + allUsers[i]).html(
                    '<span class="material-icons" id="pin_' +
                    allUsers[i] +
                    '"> push_pin </span>'
                );
                // alert(allUsers[i]);
            }
            $("#stop-screen-sharing-Mob").hide();
        });
    }

    // ***********************ADD USER*****************************
    function addUser(other_user_id, connId, userNum) {
        var newMobDivId = $("#otherTemplateMob").clone();
        newMobDivId = newMobDivId.attr("id", connId + "Mob").addClass("other");
        newMobDivId.find("h2").text(other_user_id);
        newMobDivId.find("video").attr("id", "v_" + connId + "Mob").addClass("mobView");
        //For every new user the video id and audio id will be added
        //in place of id of video
        newMobDivId.find("audio").attr("id", "a_" + connId);
        newMobDivId.show();
        $("#divUsersMob").append(newMobDivId);

        var newDivId = $("#otherTemplate").clone();
        newDivId = newDivId.attr("id", connId).addClass("other");
        newDivId.find("h2").text(other_user_id);
        newDivId.find("video").attr("id", "v_" + connId);
        //For every new user the video id and audio id will be added
        //in place of id of video
        newDivId.find("audio").attr("id", "a_" + connId);
        newDivId.show();
        $("#divUsers").append(newDivId);
        //In meeting.html there is a div with id #otherTemplate . This will show other users with the same meeting id in a grid form
        //We are appending the other user in the #divUsers id in meeting.html
        // TODO: We have to remove the other template and show the person who is currently screensharing.
        /**
         * * With Add User we have only set the socket.io connection
         * ? For the webRTC coonection we will create setNewConnection function
         */
        $(".in-call-wrap-up").append(
            '<div class="in-call-wrap d-flex justify-content-between align-items-center mb-3" id="participant_' +
            connId +
            '"> <div class="participant-img-name-wrap display-center cursor-pointer d-flex justify-content-center align-items-center p-1"> <div class="participant-img"> <img src="../public/images/other.jpg" alt="" class="border border-secondary" style="height: 40px;width: 40px;border-radius: 50%;"> </div> <div class="participant-name ms-2"> ' +
            other_user_id +
            '</div> </div> <div class="participant-action-wrap display-center" style="cursor:pointer;"><div class="participant-action-pin display-center mr-2 cursor-pointer"> <span class="material-icons" id="pin_' +
            connId +
            '"> push_pin </span> </div> </div> </div>'
        );
        $(".mobile-middle .in-call-wrap-up-Mob").append(
            '<div class="in-call-wrap-Mob d-flex justify-content-between align-items-center mb-3" id="participantMob_' +
            connId +
            '"> <div class="participant-img-name-wrap display-center cursor-pointer d-flex justify-content-center align-items-center p-1"> <div class="participant-img"> <img src="../public/images/other.jpg" alt="" class="border border-secondary" style="height: 40px;width: 40px;border-radius: 50%;"> </div> <div class="participant-name ms-2"> ' +
            other_user_id +
            '</div> </div> <div class="participant-action-wrap display-center" style="cursor:pointer;"><div class="participant-action-pin display-center mr-2 cursor-pointer"> <span class="material-icons" id="pinMob_' +
            connId +
            '"> push_pin </span> </div> </div> </div>'
        );
        $(".participant-count-Mob").text(userNum);
    }
    $(document).on("click", ".people-heading", function() {
        $(".in-call-wrap-up").show(300);
        $(".chat-show-wrap").hide(300);
        $(this).addClass("active");
        $(".chat-heading").removeClass("active");
    });
    $(document).on("click", ".chat-heading", function() {
        $(".in-call-wrap-up").hide(300);
        $(".chat-show-wrap").show(300);
        $(this).addClass("active");
        $(".people-heading").removeClass("active");
    });
    $(document).on("click", ".meeting-heading-cross", function() {
        $(".g-right-details-wrap").hide(300);
    });
    $(document).on("click", ".top-left-participant-wrap", function() {
        $(".people-heading").addClass("active");
        $(".chat-heading").removeClass("active");
        $(".g-right-details-wrap").show(300);
        $(".in-call-wrap-up").show(300);
        $(".chat-show-wrap").hide(300);
    });
    $(document).on("click", ".top-left-chat-wrap", function() {
        $(".people-heading").removeClass("active");
        $(".chat-heading").addClass("active");
        $(".g-right-details-wrap").show(300);
        $(".in-call-wrap-up").hide(300);
        $(".chat-show-wrap").show(300);
    });
    $(document).on("click", ".end-call-wrap", function() {
        $(".ending-card").show();
        $(".end-card")
            .css({
                display: "block",
            })

        .html(
            ' <div class="end-card d-flex flex-column justify-content-evenly align-content-center"><div class="btn btn-danger end-btns leave-all">End Meeting For All</div><a href="/new-meeting"><div class="call-leave-action btn btn-dark end-btns">Leave Meeting</div></a><div class="call-cancel-action btn btn-dark end-btns">Cancel</div></div>'
        );
    });
    $(document).mouseup(function(e) {
        var container = new Array();
        container.push($(".end-card"));
        $.each(container, function(key, value) {
            if (!$(value).is(e.target) && $(value).has(e.target).length == 0) {
                $(value).empty();
            }
        });
        $(".ending-card").hide();
    });
    $(document).on("click", ".call-cancel-action", function() {
        // $(".end-card").addClass("hide-div");
        $(".ending-card").hide();
    });
    $(document).on("click", ".leave-all", function() {
        // $(".end-card").addClass("hide-div");
        for (var i = 0; i < allUsers.length; i++) {
            $("#" + allUsers[i]).remove();
        }
        var meetingUrl = window.location.origin + "/new-meeting";
        window.location.replace(meetingUrl);
        return;
    });
    $(document).on(
        "click",
        ".lower-btn-section .lower-buttons .copy_info",
        function() {
            document.title = user_id;
            const urlParams = new URLSearchParams(window.location.search);
            var meeting_id = urlParams.get("meetingID");
            var meetingUrl =
                window.location.origin + "/join" + "?meetingID=" + meeting_id;
            $(".meeting_url").text(meetingUrl);
            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val($(".meeting_url").text()).select();
            document.execCommand("copy");
            $temp.remove();
            alert("Link Copied");
            // setTimeout(function() {
            //     $(".link-conf").hide();
            // }, 3000);
        }
    );
    $(document).on(
        "click",
        ".copy_info_Mob",
        function() {
            document.title = user_id;
            const urlParams = new URLSearchParams(window.location.search);
            var meeting_id = urlParams.get("meetingID");
            var meetingUrl =
                window.location.origin + "/join" + "?meetingID=" + meeting_id;
            $(".meeting_url_Mob").text(meetingUrl);
            var $temp = $("<input>");
            $("body").append($temp);
            $temp.val($(".meeting_url_Mob").text()).select();
            document.execCommand("copy");
            $temp.remove();
            alert("Link Copied");
            // setTimeout(function() {
            //     $(".link-conf").hide();
            // }, 3000);
        }
    );
    $(document).on("click", ".meeting-details-button", function() {
        $(".g-details").slideDown(300);
    });
    //Socket.io is only sendig the data between the two users but the connection is only setup by using WebRTC
    return {
        _init: function(uid, mid) {
            init(uid, mid);
        },
    };
})();