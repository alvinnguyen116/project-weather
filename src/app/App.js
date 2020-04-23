import React, {useState, useEffect, useRef} from 'react';
import Weather from "../weather/weather";
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom';
import Script from 'react-load-script';
import './App.scss';

/**
 * @desc A top level app component for the weather app.
 */
function App() {
  // CONSTANTS ---------------------------------------------------------------------------------------------------------

  const API_KEY = "AIzaSyAuthaYK4K1L1pOCEDjPbKVlnL99KxvfmI";
  const script_url = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;

  // COMPONENT STATE ---------------------------------------------------------------------------------------------------

  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [address, setAddress] = useState(null);
  const inputRef = useRef(null);

  const props = {
    isGoogleReady,
    address
  };

  return (
      <Router>
        <div className="App">
          <Script url={script_url} onLoad={() => setIsGoogleReady(true)}/>
          <div className={"search"}>
            <input type={"text"} ref={inputRef}/>
            <Link to={'/search'}>
              <button onClick={() => {setAddress(inputRef.current.value)}}>Search</button>
            </Link>
          </div>
            <Switch>
              <Route path={"/current"}>
                <Weather isSearchMode={false} {...props}/>
              </Route>
              <Route path={"/search"}>
                <Weather isSearchMode={true} {...props}/>
              </Route>
            </Switch>
        </div>
      </Router>

  );
}

export default App;
