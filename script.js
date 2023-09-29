
// Victoria
let myLat = 48.4284;
let myLong = -123.3656;
let myLocation = new google.maps.LatLng(myLat, myLong);

let map;
let service;
let infoWindowPark; // for park info
let infoWindowCurrentLocation; // for your location

let markers = [];    // a list of all markers on the map

// when the window loads, initialize the map.
window.onload = initializeMap;

// initialize map (only function to get inituated)
function initializeMap() {
  
  //center map in victoria by default
  map = new google.maps.Map(document.getElementById("map"), {
    center: myLocation,
    zoom: 13,
  });
  searchForParks(myLocation)
  
   //https://developers.goge.com/maps/documentaton/javascrpit/infowindows
  infoWindowCurrentLocation = new google.maps.InfoWindow();
  infoWindowPark = new google.maps.InfoWindow();
  
  // create "pan to current location" button
  // https://developers.google.com/maps/documentaton/javascript/geolocation
  const locationButton = document.createElement("button");
  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");

  
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          infoWindowCurrentLocation.setPosition(pos);
          infoWindowCurrentLocation.setContent("Location found.");
          infoWindowCurrentLocation.open(map);
          map.setCenter(pos);
          
          searchForParks(pos);
          
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        },
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
} //initializeMap


// Error message if geolocation fails
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation.",
  );
  infoWindow.open(map);
}




//search for parks within 5 km
// from https://developers.google.com/maps/documentation/javascript/examples/map-simple

function searchForParks(location) {
  // use places API to search for all parks within 5 km
  let request = {
    location: location,
    radius: "500", //# of meters from current location
    query: "park", //search term
  };

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, processParks);
}
// process search results for parks
function processParks(results, status){
  if(status==google.maps.places.PlacesServiceStatus.OK){
    
    deleteMarkers();

    for (let i = 0; i < results.length; i++){
      let place = results[i];
      console.log(place);
     createMarker(place);
  }
}
}



//create a marker at place
//https://developers.google.com/maps/documentation/javascript/examples/place-search
function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return;
  
  const scaledIcon = {
    url: place.icon,
    scaledSize: new google.maps.Size(30, 30), //30x30px
    orgin: new google.maps.Point(0, 0),//orgin
    anchor: new google.maps.Point(0, 0) //anchor
    
  }
  
  //https://developers.google.com/maps/documentation/javascript/markers
  const marker = new google.maps.Marker({
    map,//places marker on map
    position: place.geometry.location,
    icon: scaledIcon,
    title: place.name
  });

  
  //creates info window that will open when click on icon
  google.maps.event.addListener(marker, "click", () => {
    let contentString = "<h3>" + place.name + "</h3>" + "Rating: <b>"
          + place.rating + "</b> /5 <p>" + place.formatted_address + "</p>";
    
    infoWindowPark.setContent(contentString || "");
    infoWindowPark.open(map, marker);
  });
  
markers.push(marker);
} // createMarker



//https://developers.google.com/maps/documentation/javascript/examples/marker-remove
// then: remove old markers on the map

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  hideMarkers();
  markers = [];
}
