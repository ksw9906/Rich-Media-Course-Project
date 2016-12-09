$(document).ready(() => {
    const handleError = (message, signIn) => {
      if(signIn){
        $("#signinAlert").css("display","block");  
      }else{
        $("#loginAlert").css("display","block");
      }
      $("#errorMessage").text(message);
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
    
    $("#signupSubmit").on("click", (e) => {
        e.preventDefault();
        
        if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
            handleError("Oops! All fields are required",true);
            return false;
        }
        
        if($("#pass").val() !== $("#pass2").val()) {
            handleError("Oops! Passwords do not match!",true);
            return false;           
        }

        sendAjax($("#signupForm").attr("action"), $("#signupForm").serialize());
        
        return false;
    });

    $("#loginSubmit").on("click", (e) => {
        e.preventDefault();
    
        if($("#user").val() == '' || $("#pass").val() == '') {
            handleError("Oops! Username or password is empty!",false);
            return false;
        }
    
        sendAjax($("#loginForm").attr("action"), $("#loginForm").serialize());

        return false;
    });
});