self.addEventListener('install', function(event) {
 event.waitUntil(
   caches.open('mws-restaurant-stage-1-static-v61')
    .then(
        function(cache) { //opening static cache name
             return cache.addAll([
              //  accessible materials that will work offline
                // '/skeleton',
                '/',
                '/css/styles.css',
                '/index.html',
                '/restaurant.html',
                '/data/restaurants.json',
                './sw.js',
                // '/dist/leaflet.css',
                // '/dist/leaflet.js',
                '/js/dbhelper.js',
                '/js/indexController.js',
                '/js/main.js',
                '/js/restaurant_info.js',
                '/img/1.jpg',
                '/img/2.jpg',
                '/img/3.jpg',
                '/img/4.jpg',
                '/img/5.jpg',
                '/img/6.jpg',
                '/img/7.jpg',
                '/img/8.jpg',
                '/img/9.jpg',
                '/img/10.jpg',
                '/img/dr-evil.gif',
            ]);
        })
    );
});


self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
        .then(function(cacheNames) {
              return Promise.all( cacheNames.filter(
                 function(cacheName) {
                     return cacheName.startsWith('mws-restaurant-') && 
                            cacheName != staticCacheName;
                  }).map(function(cacheName) {
                          return caches.delete(cacheName); //deleteling the old caches
                  })
              );
          })
        );
    });


self.addEventListener('fetch', function(event) {

    var requestUrl = new URL(event.request.url);
  //log the requests made from the parent page.
    console.log(requestUrl);
   
    //we update to allow this app to work offline-fisrt
    event.respondWith( //setting the "cache falling back to network"
      caches.match(event.request)
        .then(
          function(response) {
            if (response){
              return response;
              // return response || fetch(event.request);
              // return fetch(event.request); //=> we'll use this in order to allow online users to be the first
            }
        // })
        return fetch(event.request)
          .then(
            function(response){
              if (response.status === 404){
                console.error('Network not found');
                // fetch('/img/dr-evil.gif') it should display a gif image in case something goes wrong
            }
              return response
            });
        })
        //in case this app fails to cache something for the network behaviors, this generic fallback will come for help
         .catch( 
           function(){
             return caches.match('/index.html');
        }).catch(
           function(){
             return caches.match('/restaurants.html');
           }
         )
    );
   });

