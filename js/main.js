let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.setAttribute('role', 'link');
    // option.setAttribute('tabindex', '0');
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 10,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiYmphbnZpZXIiLCJhIjoiY2psNjV6MHBjMDduNDN2cGY5cGg2c205aiJ9.tR8xw1RWygpppp72tyuJoA',//pk.eyJ1IjoiYmphbnZpZXIiLCJhIjoiY2psNjV6MHBjMDduNDN2cGY5cGg2c205aiJ9.tR8xw1RWygpppp72tyuJoA
    // mapboxToken: '<your MAPBOX API KEY HERE>',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.setAttribute('role', 'listitem');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute('role', 'img');
  image.src = DBHelper.imageUrlForRestaurant(restaurant); 
  /**
   * Allowing accessibities to all users
   */
  image.setAttribute('role', 'presentation');
  image.alt = `A picture of ${restaurant.name}`;
  image.title = restaurant.name;//tooltip //151 in dbhelper
  li.append(image);


  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  name.setAttribute('aria-labelledby', restaurant.name);
  name.setAttribute('aria-live', 'polite');
  li.append(name);

  const neighborhood = document.createElement('address');
  neighborhood.innerHTML =`<p>${restaurant.neighborhood}</p>` ;
  neighborhood.setAttribute('aria-labelledby', restaurant.neighborhood);
  li.append(neighborhood);

  const address = document.createElement('address');
  address.setAttribute('aria-labelledby', restaurant.address);
  address.setAttribute('role', 'link');
  address.innerHTML = `<p> ${restaurant.address}</p>` ;
  li.append(address);
  
/**
 * Making both the <span> and <a> to link to the restaurant when this is clicked by the user
 */
  const more = document.createElement('a');
  const span = document.createElement('span');
  span.innerHTML = `View Details`;
  more.innerHTML = ``; 
  more.title = `Click here to learn more about ${restaurant.name}'s restaurant`;
  more.setAttribute('role', 'link');
  more.setAttribute('aria-live', 'polite');
  more.setAttribute('aria-labelledby', 'View Detaitls');
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.append(image);
  more.append(span);
  li.append(more);

  return li
}


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => { //looping through restaurants[] from restaurants.json
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
} 

































/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

