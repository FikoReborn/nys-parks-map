import React, { Component } from 'react';
import { GoogleApiWrapper, Map } from 'google-maps-react';
import './App.css';

class ParkMap extends Component {
  render() {
    return (
        <Map
            className="map"
            google={this.props.google}
            zoom={7}
            initialCenter={{
                lat: 41.7004,
                lng: -73.9210
            }}
        />

    );
  }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyCGnAvu4__n-bl-rsNch6sLTHksCDbWJGg'
})(ParkMap);
