import React, { Component } from 'react';
import 'font-awesome/css/font-awesome.min.css';
import './App.css';

class FilterOptions extends Component {
  selectMarker = e => {
    // Select Marker after listitem is clicked.
    const map = this.props.map;
    const markerId = Number(e.target.id);
    const markers = this.props.markers;
    const markerIndex = markers.findIndex(marker => marker.id === markerId);
    this.props.fetchParkData(map, markers[markerIndex]);
  };

  menuOpen = () => {
    const filterDiv = document.getElementsByClassName(
      'filter-options-container'
    )[0];
    const filterContent = document.getElementsByClassName('filter-content')[0];
    filterDiv.classList.toggle('extend');
    filterContent.classList.toggle('show');
  };

  render() {
    const { counties, filterCounty, error, markers, loadedOnline } = this.props;
    return (
      <div className="filter-options-container">
        <span className="mobile-menu" onClick={this.menuOpen}>
          <i className="fa fa-2x fa-bars menu-icon" />
        </span>
        <div className="filter-form">
          <select className="filter-counties-list" onChange={filterCounty} aria-label="Filter Locations by County">
            <option>All Counties</option>
            {counties.map(county => (
              <option key={county}>{county}</option>
            ))}
          </select>
        </div>
        <div className="filter-content">
          {!error && loadedOnline ? (
            <ul className="list-locations">
              {markers.map(
                marker =>
                  marker.map !== null && (
                    <li key={marker.id}>
                      <button
                        onClick={this.selectMarker}
                        id={marker.id}
                        className="location-button"
                      >
                        {marker.title} {marker.type}
                      </button>
                    </li>
                  )
              )}
            </ul>
          ) : (
            <p>Sorry, parks data could not be loaded.</p>
          )}
          <p className="parkdata-text">
            Data from{' '}
            <a
              href="https://data.ny.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open NY
            </a>
          </p>
        </div>
      </div>
    );
  }
}

export default FilterOptions;
