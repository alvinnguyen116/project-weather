import React, {useEffect, useState, useRef, useMemo} from "react";
import {getWeather, UNIT} from "../api";
import './weather.scss';

/**
 * @return {null}
 */
function Weather({isGoogleReady, isD3Ready, isSearchMode, address, setInputVal, inputVal}) {

    const BUTTON = Object.freeze({
       TEMPERATURE: "0",
       PRECIPITATION: "1",
       WIND: "2"
    });

    const [currentLocation, setCurrentLocation] = useState();
    const [currentUnit, setCurrentUnit] = useState(UNIT.FAHRENHEIT);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [currentDay, setCurrentDay] = useState(0);
    const [currentButton, setCurrentButton] = useState(BUTTON.TEMPERATURE);
    const svgRef = useRef(null);

    // SIDE EFFECTS ----------------------------------------------------------------------------------------------------

    useEffect(() => {
        /*global d3*/
        if(isD3Ready && currentWeather && currentWeather.hourly && currentWeather.hourly.length) {
            const width = 618;
            const height = 56;
            const data = [];
            currentWeather.hourly.slice(0,24).forEach(({dt, temp, wind_speed, rain}, i) => {
               let value;
               switch (currentButton) {
                   case BUTTON.TEMPERATURE:
                       value = temp;
                       break;
                   case BUTTON.PRECIPITATION:
                       value = rain ? rain['1h'] : 0;
                       break;
                   case BUTTON.WIND:
                       value = wind_speed;
                       break;
                   default:
                       break;
               }
               data.push({i,value});
            });

            const svg = d3.select(svgRef.current)
                .attr("width", width)
                .attr("height", height);
            svg.selectAll("g").remove();
            const g = svg.append('g');

            const x = d3.scaleTime()
                .rangeRound([0, width])
                .domain([0, 23]);
            let ydomain = d3.extent(data.map(d => d.value));
            if (currentButton === BUTTON.PRECIPITATION) {
                ydomain = [0,1];
            }
            const y = d3.scaleLinear()
                .rangeRound([height, 0])
                .domain(ydomain);
            const line = d3.line()
                .x(d => x(d.i))
                .y(d => Math.round(y(d.value)));

            g.append("path").datum(data)
                .attr("stroke", "#ec6e4c")
                .attr("stroke-width", 2)
                .attr("fill", "none")
                .attr("d", line);
        }
    }, [currentWeather, isD3Ready, currentButton]);

    useEffect(() => {
        if (currentLocation) {
            getWeather(currentLocation, currentUnit).then(setCurrentWeather);
        } else {
            setCurrentWeather(null);
        }
    }, [currentLocation, currentUnit]);

    useEffect(() => {
        if (!isSearchMode) {
            navigator.geolocation.getCurrentPosition(pos => {
                const {latitude: lat, longitude: lon} = pos.coords;
                setCurrentLocation({lat, lon});
                setInputVal(`${lat},${lon}`);
            });
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
                        setInputVal(address);
                    }
                });
            } catch (e) {
                throw(e);
            }
        };
        autocompleteService.getQueryPredictions({input}, getLocationCB.bind(null, setCurrentLocation));
    }

    const title = useMemo(() => inputVal.split(',').slice(-3).join(','), [currentWeather]);

    if (currentWeather) {
        const {current, daily, hourly} = currentWeather;
        let {humidity, rain, dt, temp, wind_speed, weather} = current;
        temp = Math.round(temp);
        let description;
        let icon;
        if (weather && weather.length) {
            description = weather[0].description;
            icon = weather[0].icon;
        }
        const iconURL = `url(http://openweathermap.org/img/wn/${icon}@2x.png)`;
        const today = new Date(dt*1000);
        const weeks = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const hours = today.getHours();
        const todayString = `${weeks[today.getDay()]} ${hours % 12 ? hours % 12 : 12}:00 ${hours > 11 ? 'PM' : 'AM'}`;

        let fspan = <span>°F</span>;
        let cspan = <span>°C</span>;
        if (currentUnit === UNIT.FAHRENHEIT) {
            cspan = <div className={"link"} onClick={() => setCurrentUnit(UNIT.CELSIUS)}>{cspan}</div>;
        } else {
            fspan = <div className={"link"} onClick={() => setCurrentUnit(UNIT.FAHRENHEIT)}>{fspan}</div>;
        }

        const dailyCards = daily.map((props,i) =>
            <DailyWeather {...props} key={props.dt} active={currentDay === i} handleClick={() => setCurrentDay(i)}/>
        );

        const timeLabels = hourly.slice(0,24).filter((item,i) => i % 3 === 1).map(({dt}) => <TimeLabel key={dt} dt={dt}/>);

        return (
            <div className={'weather'}>
                <div className={'current'}>
                    <div className={"top"}>
                        <div className={"title"}>{isSearchMode ? title : ''}</div>
                        <div className={"time"}>{todayString}</div>
                        {description ? (<div className={"description"}>{description}</div>) : null}
                    </div>
                    <div className={"middle"}>
                        <div className={"temp-container"}>
                            {icon ? <div className={"image"} style={{backgroundImage:iconURL}}/> : null}
                            <div className={"temp"}>{temp}</div>
                            <div className={"temp-options"}>
                                {fspan} &nbsp; | &nbsp; {cspan}
                            </div>
                        </div>
                        <div className={"right"}>
                            <div className={"precipitation"}>Precipitation: {`${rain ? rain['1h'] : 0}%`}</div>
                            <div className={"humidity"}>Humidity: {`${humidity}%`}</div>
                            <div className={"wind"}>Wind: {`${wind_speed} mph`}</div>
                            <div className={"buttons"}>
                                <button onClick={() => setCurrentButton(BUTTON.TEMPERATURE)}>Temperature</button>
                                <button onClick={() => setCurrentButton(BUTTON.PRECIPITATION)}>Precipitation</button>
                                <button onClick={() => setCurrentButton(BUTTON.WIND)}>Wind</button>
                            </div>
                        </div>
                    </div>
                    <svg ref={svgRef}/>
                    <div className={"time-labels"}>
                        {timeLabels}
                    </div>
                    <div className={"bottom"}>
                        {dailyCards}
                    </div>
                </div>
            </div>
        );
    }
    return null;
}

function DailyWeather({temp,weather,dt, active, handleClick}) {
    let {min,max} = temp;
    min = Math.round(min);
    max = Math.round(max);
    let icon;
    if (weather && weather.length) {
        icon = weather[0].icon;
    }
    const iconURL = `url(http://openweathermap.org/img/wn/${icon}@2x.png)`;
    const today = new Date(dt*1000);
    const weeks = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = weeks[today.getDay()].substring(0,3);
    return (
        <div className={`daily-weather ${active ? 'active' : ''}`} onClick={handleClick}>
            <div className={"day"}>{day}</div>
            {icon ? <div className={"image"} style={{backgroundImage:iconURL}}/> : null}
            <div className={"degrees"}>
                <span className={"max"}>{max}°</span>
                <span>{min}°</span>
            </div>
        </div>
    )
}

function TimeLabel({dt}) {
    const today = new Date(dt*1000);
    const hour = today.getHours();

    return (
        <div className={"time-label"}>
            {hour % 12 === 0 ? 12 : hour % 12} {hour > 11 ? 'PM' : 'AM'}
        </div>
    )
}


export default Weather;