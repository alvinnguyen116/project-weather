import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import './index.css';
import App from './app/App';

ReactDOM.render(
  <React.StrictMode>
      <Router>
          <Switch>
              <Route path={"/current"}>
                  <App isSearchMode={false}/>
              </Route>
              <Route path={"/search"}>
                  <App isSearchMode={true}/>
              </Route>
          </Switch>
      </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
