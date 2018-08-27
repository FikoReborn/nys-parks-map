import React, { Component } from "react";
import ParkContent from "./ParkContent";
import { GoogleApiWrapper, Map, Marker, InfoWindow } from "google-maps-react";
import "./App.css";

class ParkMap extends Component {
  componentDidMount = () => {
    this.props.findMap(this.refs.map.map);
  };

  render() {
    const {
      stopAnimation,
      pullMarkers,
      locations,
      activeMarker,
      markerVisible,
      foursquareData,
      placesData,
      fetchParks,
      fetchParkData
    } = this.props;

    return (
      <div className="map-container">
      <p className="parkdata-text">Locations from: <a href="https://data.ny.gov/" target="_blank" rel="noopener noreferrer">Open NY</a> </p>
        <Map
          role="application"
          ref="map"
          className="map"
          google={this.props.google}
          mapTypeControl={false}
          onReady={fetchParks}
        >
          {locations.filter(filteredpark => filteredpark.display).map(park => (
            <Marker
              icon={"http://maps.google.com/mapfiles/ms/micons/tree.png"}
              ref={pullMarkers}
              key={park.id}
              id={park.id}
              title={park.title}
              type={park.type}
              position={park.location}
              website={park.website}
              county={park.county}
              visibility={false}
              onClick={fetchParkData}
            />
          ))}
          <InfoWindow role="dialog" marker={activeMarker} visible={markerVisible} onClose={stopAnimation}>
            <ParkContent
              activeMarker={activeMarker}
              foursquareData={foursquareData}
              placesData={placesData}
            />
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyCGnAvu4__n-bl-rsNch6sLTHksCDbWJGg"
})(ParkMap);
