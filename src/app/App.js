import React, {useState, useEffect, useRef} from 'react';
import Weather from "../weather/weather";
import {Link, Route, Switch, useHistory} from 'react-router-dom';
import Script from 'react-load-script';
import './App.scss';

/**
 * @desc A top level app component for the weather app.
 */
function App() {
  // CONSTANTS ---------------------------------------------------------------------------------------------------------

  const API_KEY = "AIzaSyAuthaYK4K1L1pOCEDjPbKVlnL99KxvfmI";
  const script_url = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
  const history = useHistory();

  // COMPONENT STATE ---------------------------------------------------------------------------------------------------

  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isD3Ready, setIsD3Ready] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [address, setAddress] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  const props = {
    isGoogleReady,
    isD3Ready,
    address,
    inputVal,
    setInputVal
  };

  const handleOnKeyUp = e => {
    if (e.keyCode === 13) {
      setAddress(inputVal);
      history.push('/search');
    }
  };
  return (
        <div className="App">
          <Script url={script_url} onLoad={() => setIsGoogleReady(true)}/>
          <Script url="https://d3js.org/d3.v4.min.js" onLoad={() => setIsD3Ready(true)}/>
          <div className={"search"}>
            <div className={`search-container ${isFocus ? 'focus' : ''}`}>
              <input type={"text"}
                     ref={inputRef}
                     value={inputVal}
                     spellCheck={false}
                     onChange={e => setInputVal(e.target.value)}
                     onKeyUp={handleOnKeyUp}
                     onFocus={() => setIsFocus(true)}
                     onBlur={() => setIsFocus(false)}/>
            </div>
            <Link to={'/search'}>
              <button onClick={() => {setAddress(inputVal)}}>Search</button>
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
  );
}

export default App;
