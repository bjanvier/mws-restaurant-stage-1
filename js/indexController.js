if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
             .then(function() { //=> this promise will be called if the Service Worker was successfully registered
                   console.log("Service Worker Registered");
         })
            .catch( function(){ //=>this promise will be called the Service Worker registration was unsuccessful
                console.error('Service worker is still not registered yet')
            });
  }
