import React from "react";
import "./App.css";

const FilterOptions = props => {
  const { counties, locations, filterCounty, selectMarker } = props;
  return (
    <div className="filter-options-container">
      <select
        className="filter-counties-list"
        onChange={filterCounty}
      >
        <option>All Counties</option>
        {counties.map(county => (
          <option key={county}>{county}</option>
        ))}
      </select>
      <ul className="list-locations">
        {locations.map(
          thislocation =>
            thislocation.display && (
              <li key={thislocation.id}>
                <button onClick={selectMarker} id={thislocation.id}>{thislocation.title} {thislocation.type}</button>
              </li> 
            )
        )}
      </ul>
    </div>
  );
};

export default FilterOptions;
