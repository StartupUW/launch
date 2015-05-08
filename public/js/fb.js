  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
        if (response.status == 'connected') {
          APILogin(response.authResponse.accessToken);
        }
    });
  }

  window.fbAsyncInit = function() {
      FB.init({
        appId      : '845062025559463',
        xfbml      : true,
        version    : 'v2.3',
        cookie     : true,  // enable cookies to allow the server to access 
      });
  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function APILogin(token) {
    FB.api('/me', function(response) {
        $.post('/login', {token : token})
            .done(function(data) {
                if (data.user) {
                    location.reload();
                } else {
                    $("#name").html(response.name);
                    $("#email").val(response.email);
                    $("#create-profile").modal('show');
                }
            })

          console.log(response);
          console.log('Successful login for: ' + response.name);
    });
  }
