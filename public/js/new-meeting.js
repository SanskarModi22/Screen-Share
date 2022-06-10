$(function() {
    $(document).on("click", ".create-meeting", function() {
        var join_name = $(".enter-name").val();
        if (join_name == "")
            var join_mob_name = $(".join-name").val();
        var eight_d_value = Math.floor(Math.random() * 100000000);
        //Generating a random 8 digit number
        if (join_name == "" && join_mob_name == "")
            alert("Please Enter Your name");
        else {
            if (join_mob_name == undefined)
                var meetingUrl =
                    window.location.origin + "/meeting" + "?meetingID=" + eight_d_value + "&name=" + join_name;
            else
                var meetingUrl =
                    window.location.origin + "/meeting" + "?meetingID=" + eight_d_value + "&name=" + join_mob_name;
            window.location.replace(meetingUrl);
        }
    });
});