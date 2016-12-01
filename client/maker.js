$(document).ready(function() {

    const handleError = (message) => {
        $("#errorMessage").text(message);
        $("#domoMessage").animate({width:'toggle'},350);
    }
    
    const sendAjax = (action, data) => {
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            success: (result, status, xhr) => {
                $("#domoMessage").animate({width:'hide'},350);

                window.location = result.redirect;
            },
            error: (xhr, status, error) => {
                const messageObj = JSON.parse(xhr.responseText);
            
                handleError(messageObj.error);
            }
        });        
    }
    
    $("#makeDomoSubmit").on("click", (e) => {
        e.preventDefault();
    
        $("#domoMessage").animate({width:'hide'},350);
    
        if($("#domoName").val() == '' || $("#domoAge").val() == '') {
            handleError("RAWR! All fields are required");
            return false;
        }

        sendAjax($("#domoForm").attr("action"), $("#domoForm").serialize());
        
        return false;
    });
  
    $("body").on("click", (e) =>{
      var target = $(e.target);
      var token = document.getElementById("domoForm")[3].value;
      if(target[0].className === "deleteButton"){
        var data = {name: target[0].name,
                    _csrf: token,};
        $.ajax({
            cache: false,
            type: "POST",
            url: "/remove",
            data: data,
            dataType: "json",
            success: (result, status, xhr) => {
              window.location = result.redirect;
            },
            error: (xhr, status, error) => {
              console.log(error);
            }
        });        
      }
    });
});