import React, {useEffect, useState} from "react";
import {getWeather, UNIT} from "../api";

/**
 * @return {null}
 */
function Weather({isGoogleReady, isSearchMode, address}) {

    const [currentLocation, setCurrentLocation] = useState();
    const [currentWeatherFahrenheit, setCurrentWeatherFahrenheit] = useState(null);

    // SIDE EFFECTS ----------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (currentLocation) {
            getWeather(currentLocation, UNIT.FAHRENHEIT).then(setCurrentWeatherFahrenheit);
        } else {
            setCurrentWeatherFahrenheit(null);
        }
    }, [currentLocation]);

    useEffect(() => {
        if (!isSearchMode) {
            navigator.geolocation.getCurrentPosition(pos => {
                const {latitude: lat, longitude: lon} = pos.coords;
                setCurrentLocation({lat, lon});
            })
        }
    }, [isSearchMode]);

    useEffect(() => {
        if (isSearchMode && isGoogleReady && address) {
            getLocation(address);
        } else {
            setCurrentLocation(null);
        }
    }, [address]);

    // METHODS -----------------------------------------------------------------------------------------------------------

    function getLocation(input) {
        /*global google*/
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
                        <div className={"precipitation"}>Precipitation: {`${rain ? rain : 0}%`}</div>
                        <div className={"humidity"}>Humidity: {`${humidity}%`}</div>
                        <div className={"wind"}>Wind: {`${wind_speed} mph`}</div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
}

export default Weather;