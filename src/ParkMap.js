import React, { Component } from 'react';
import ParkContent from './ParkContent';
import { GoogleApiWrapper, Map, Marker, InfoWindow } from 'google-maps-react';
import './App.css';

class ParkMap extends Component {
  componentDidMount = () => {
    this.props.isOnline && this.props.findMap(this.refs.map.map);
    window.gm_authFailure = () => {
      console.log('auth fail');
    }
    console.log(this.props.isOnline)
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
      fetchParkData,
      isOnline,
      loadedOnline
    } = this.props;

    return (
      <div className="map-container">
        {!isOnline && (
          <div className="map-error">
            <span className="over-map-error"><p>You appear to be offline. Maps may not respond as intended.</p></span>
          </div>
        )}
          <Map
          role="application"
          ref="map"
          className="map"
          google={this.props.google}
          mapTypeControl={false}
          onReady={fetchParks}
        >
          {locations.map(park => (
            <Marker
              animation={window.google.maps.Animation.DROP}
              ref={pullMarkers}
              key={park.id}
              id={park.id}
              title={park.title}
              type={park.type}
              position={park.location}
              website={park.website}
              county={park.county}
              onClick={fetchParkData}
            />
          ))}
          <InfoWindow
            marker={activeMarker}
            visible={markerVisible}
            onClose={stopAnimation}
          >
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
  apiKey: 'AIzaSyCGnAvu4__n-bl-rsNch6sLTHksCDbWJGg'
})(ParkMap);
