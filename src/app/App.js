import React, {useState, useEffect, useRef} from 'react';
import {getWeather, UNIT} from "../api";
import Script from 'react-load-script';
import './App.scss';
/**
 * @param isSearchMode {boolean}
 * @desc A top level app component for the weather app.
 */
function App({isSearchMode}) {
  // CONSTANTS ---------------------------------------------------------------------------------------------------------

  const API_KEY = "AIzaSyAuthaYK4K1L1pOCEDjPbKVlnL99KxvfmI";

  // COMPONENT STATE ---------------------------------------------------------------------------------------------------

  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState();
  const [currentWeatherFahrenheit, setCurrentWeatherFahrenheit] = useState(null);
  const inputRef = useRef(null);

  // SIDE EFFECTS ------------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (currentLocation) {
      getWeather(currentLocation, UNIT.FAHRENHEIT).then(setCurrentWeatherFahrenheit);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (isGoogleReady) {
      if (isSearchMode) {
        getLocation('2119 University Ave ');
      } else {
        navigator.geolocation.getCurrentPosition(pos => {
          const {latitude: lat, longitude: lon} = pos.coords;
          setCurrentLocation({lat, lon});
        })
      }
    }
  }, [isGoogleReady]);

  // HANDLERS ----------------------------------------------------------------------------------------------------------

  const handleOnLoad = () => {
    /*global google*/
    setIsGoogleReady(true);
  };

  const handleOnClick = () => {
    console.log(inputRef.current);
  };

  // METHODS -----------------------------------------------------------------------------------------------------------

  function getLocation(input) {
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
    autocompleteService.getQueryPredictions({input}, getLocationCB.bind(null, setCurrentLocation));
  }

  const renderCard = () => {
    console.log(currentWeatherFahrenheit);
    if (currentWeatherFahrenheit) {
      const {current} = currentWeatherFahrenheit;
      const {humidity, rain, dt, temp, wind_speed, weather} = current;
      let description;
      if (weather && weather.length) {
        description = weather[0].description;
      }
      const today = new Date(dt*1000);
      const weeks = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const hours = today.getHours();
      const todayString = `${weeks[today.getDay()]} ${hours % 12}:00 ${hours > 11 ? 'PM' : 'AM'}`;

      return (
        <div className={'weather'}>
          <div className={'current'}>
            <div className={"left"}>
              <div className={"time"}>{todayString}</div>
              <div className={"description"}>{description}</div>
            </div>
            <div className={"right"}>
              <div className={"precipitation"}>{`${rain ? rain : 0}%`}</div>
              <div className={"humidity"}>{`${humidity}%`}</div>
              <div className={"wind"}>{`${wind_speed} mph`}</div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="App">
      <Script
          url={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`}
          onLoad={handleOnLoad}
      />
      <div className={"search"}>
        <input type={"text"} ref={inputRef}/>
        <button onClick={handleOnClick}>Search</button>
      </div>
      {renderCard()}
    </div>
  );
}

export default App;
