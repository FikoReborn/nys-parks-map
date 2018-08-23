import React from "react";
import "font-awesome/css/font-awesome.min.css";
import "./App.css";

function FilterOptions(props) {
    const { counties, locations, filterCounty, selectMarker, error, menuOpen } = props;
    return (
      <div className="filter-options-container">
        <div className="filter-form">
          <select
            className="filter-counties-list"
            onChange={filterCounty}
          >
            <option>All Counties</option>
            {counties.map(county => (
              <option key={county}>{county}</option>
            ))}
          </select>
        </div>
        <span className="mobile-menu" onClick={menuOpen}>
          <i className="fa fa-2x fa-bars menu-icon"></i>
        </span>
        {!error ? (
          <ul className="list-locations">
            {locations.map(
              thislocation =>
                thislocation.display && (
                  <li key={thislocation.id}>
                    <button onClick={selectMarker} id={thislocation.id} className="location-button">{thislocation.title} {thislocation.type}</button>
                  </li>
                )
            )}
          </ul>
        ) : (
            <p>Sorry, parks data could not be loaded.</p>
          )}
      </div>
    );
  };

export default FilterOptions;
