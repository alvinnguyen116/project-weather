import React, {useState, useEffect} from 'react';
import {getWeather} from "../api";
import Script from 'react-load-script';
import './App.css';

function App() {
  // CONSTANTS ---------------------------------------------------------------------------------------------------------

  const API_KEY = "AIzaSyAuthaYK4K1L1pOCEDjPbKVlnL99KxvfmI";

  // COMPONENT STATE ---------------------------------------------------------------------------------------------------

  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({lat: null, lon: null});

  // SIDE EFFECTS ------------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (currentLocation && currentLocation.lat && currentLocation.lon) {
      getWeather(currentLocation).then(console.log);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (isGoogleReady) {
      getLocation('45 muirfield ct', setCurrentLocation);
    }
  }, [isGoogleReady]);

  // HANDLERS ----------------------------------------------------------------------------------------------------------

  const handleOnLoad = () => {
    /*global google*/
    setIsGoogleReady(true);
  };

  // METHODS -----------------------------------------------------------------------------------------------------------

  function getLocation(input, callback) {
    if (!isGoogleReady) return;
    const autocompleteService = new google.maps.places.AutocompleteService();
    const geoCoderService = new google.maps.Geocoder();
    const getLocationCB = (cb, predictions, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error(status);
        return;
      }
      try {
        const {description: address} = predictions[0];
        console.log(address);
        geoCoderService.geocode({address}, (res) => {
          if (res && res.length) {
            const {location} = res[0].geometry;
            cb({lat:location.lat(), lon: location.lng()});
          }
        });
      } catch (e) {
        throw(e);
      }
    };
    autocompleteService.getQueryPredictions({input}, getLocationCB.bind(null, callback));
  }

  return (
    <div className="App">
      <Script
          url={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`}
          onLoad={handleOnLoad}/>
    </div>
  );
}

export default App;
