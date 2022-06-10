$(function() {
    // $(document).on("click", ".join-meeting", function() {
    //     $(".enter-code").focus();
    // });
    $(document).on("click", ".join-action", function() {
        var join_value = $(".enter-code").val();
        var join_name = $(".enter-name").val();
        if (join_value == "") {
            $(".enter-code").focus();
            alert("Write the meeting room");
        } else if (join_name == "") {
            $(".enter-name").focus();
            alert("Enter your name");
        } else {
            var meetingUrl =
                window.location.origin +
                "/meeting" +
                "?meetingID=" +
                join_value +
                "&name=" +
                join_name;
            window.location.replace(meetingUrl);
        }
    });
    //The keyboard textarea will be focussed when we click on join meeting . Keyboard has .enter-code class and join buttin has .join-meeting class
    //After focussing we will replace the window address with room address
});