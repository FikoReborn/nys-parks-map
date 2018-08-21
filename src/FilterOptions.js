import React from "react";
import "./App.css";

const FilterOptions = props => {
  const { counties, locations, filterCounty, selectMarker } = props;
  return (
    <div className="filter-options-container">
    <div class="filter-form">
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
      <ul className="list-locations">
        {locations.map(
          thislocation =>
            thislocation.display && (
              <li key={thislocation.id}>
                <button onClick={selectMarker} id={thislocation.id} class="location-button">{thislocation.title} {thislocation.type}</button>
              </li> 
            )
        )}
      </ul>
    </div>
  );
};

export default FilterOptions;
