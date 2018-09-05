let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});


/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        // mapboxToken: '<your MAPBOX API KEY HERE>',
        mapboxToken: 'pk.eyJ1IjoiYmphbnZpZXIiLCJhIjoiY2psNjV6MHBjMDduNDN2cGY5cGg2c205aiJ9.tR8xw1RWygpppp72tyuJoA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  /**
   * Restaurant's accessibilities
   */
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.title = `This restaurant's name is ${restaurant.name}`;
  name.setAttribute('aria-live', 'polite');
  name.setAttribute('aria-labelledby', restaurant.name);

  /**
   * aria-current="location" role="application" aria-label="The current Map box"
   */
  const map = document.getElementById('map');
  map.title = `The map box of ${restaurant.name}`;
  map.setAttribute('aria-label', `the map box of ${restaurant.name}`)

  /**
   * addresses accessibilities
   */
  const address = document.getElementById('restaurant-address');
  address.setAttribute('aria-live', 'polite');
  address.setAttribute('aria-labelledby', restaurant.address);
  address.title = `The ${restaurant.address}'s address`;
  address.innerHTML = restaurant.address;

  /**
   * images accessibilities
   */
  const image = document.getElementById('restaurant-img');
  image.alt = restaurant.name;//
  image.setAttribute('role', 'presentation');
  image.title =`The image of ${restaurant.name}'s restaurant `;//when the user hover over the image, he/she will see the restaurant's name displays
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  /**
   * cuisines types accessibilities
   */
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.setAttribute('aria-live', 'polite');
  cuisine.setAttribute('aria-labelledby', restaurant.cuisine_type);
  cuisine.title = `${restaurant.cuisine_type}'s cuisine`;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 * 
 * DOM:    <table tabindex="6" id="restaurant-hours"></table>
 * 
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.setAttribute('role', 'rowgroup');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.title = key;
    day.setAttribute('role', 'cell');
    day.setAttribute('aria-labelledby', key);
    day.setAttribute('aria-live', 'polite');
    row.appendChild(day);

    const time = document.createElement('td');
    time.setAttribute('role', 'cell');
    time.innerHTML = operatingHours[key];
    time.setAttribute('aria-labelledby', operatingHours[key]);
    time.setAttribute('aria-live', 'polite');
    time.title = `Operating hours are ${operatingHours[key]}`;
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
    <section tabindex="7" id="reviews-container">
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  /**
   * Reviews content
   */
  const container = document.getElementById('reviews-container');

  /**
   * review's title accessibilities
   */
  const aTitle = document.createElement('h3');
  aTitle.innerHTML = 'Reviews';
  aTitle.setAttribute('aria-labelledby', 'Review');
  aTitle.title = 'Reviews';
  container.appendChild(aTitle);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.setAttribute('aria-live', 'polite');
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => { //looping through reviews[] from restaurants.json
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');


  /**
   * reviews authors accessibilities
   */
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'review-author';
  name.setAttribute('aria-labelledby', review.name);
  name.setAttribute('aria-live', 'polite');
  name.title = `This comment's author is ${review.name}`;
  // name.appendChild(date);
  name.style.width =  '50%';
  li.appendChild(name);


  /**
   * reviews date written accessibilities
   */
  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.className = 'review-date';
  date.setAttribute('aria-labelledby', review.date);
  date.setAttribute('aria-live', 'polite');
  date.style.width =  '50%';
  date.title = `This review was written on ${review.date} by ${review.name}`;
  li.appendChild(date);

   /**
    * this to combine both the author's comment/review and the date he/she commented
    */

    const authorDate = document.createElement('div');
    authorDate.className = 'author-and-date';
    authorDate.innerHTML = `<span class="fa fa-toggle"></span>`;
    authorDate.style.display = 'flex';
    authorDate.style.display = 'wrap';
    authorDate.append(name);
    authorDate.append(date);
    li.appendChild(authorDate);

  /**
   * reviewws ratings accessibilities
   */
  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'rating';
  rating.title = `Rating: ${review.rating}`;
  rating.setAttribute('aria-live', 'polite');
  rating.setAttribute('aria-labelledby', review.rating);
  li.appendChild(rating);

  /**
   * reviews comments accessibilities
   */
  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute('aria-live', 'polite');
  comments.setAttribute('aria-labelledby', review.comments);
  comments.title = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
    <ul id="breadcrumb" >
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-labelledby', restaurant.name);
  li.setAttribute('aria-live', 'polite');
  li.title = `${restaurant.name}'s restaurant`;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

















/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */