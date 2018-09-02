/**
 * we open our directory( CacheStorage.open() as described by MDN ==> https://developer.mozilla.org/en-US/docs/Web/API/Cache/addAll)
 *  to create new caches,
 *  then add all the files we want to be accessible offline first
 */
self.addEventListener('install', function(event) {
 event.waitUntil(
   caches.open('mws-restaurant-stage-1-static-v1')
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

/**
 * Updates
 */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(
        function(cacheNames) {
              return Promise.all( 
                cacheNames.filter(
                 function(cacheName) {
                     return cacheName.startsWith('mws-restaurant-') && 
                            cacheName != staticCacheName;
                  }).map(function(cacheName) {
                          return caches.delete(cacheName); //deleting the old caches
                  })
              );
          })
        );
    });

    /**
     * Setting the offline accessibilities so the user will be able to 
     * visit the pages he visited when he was online
     */
    self.addEventListener('fetch', function(event) {
      event.respondWith(
        caches.match(event.request)
          .then(
            function(response) {
            if (response) {
              return response;
            }
      /**
       * Duplicating our existing Request 
       * //https://developer.mozilla.org/en-US/docs/Web/API/Request/clone
       */
          return fetch(event.request.clone()) 
            .then(
                function(response) {
                  // Checking if the request was unsuccessful
                  if (!response.ok) {
                    console.log('Caches responses', response)
                    return response;
                  }
     
                  var requestCopy = response.clone();
        
              caches.open('mws-restaurant-stage-1-static-v1') 
                  .then(
                    function(cache) {
                      cache.put(event.request, requestCopy);  //combining their values
                  });
                  return response;
                  })
                  .catch(function(e) {
                      console.error('Fetching operation failed:', e);
                  throw e;
              });
            })
        );
    });