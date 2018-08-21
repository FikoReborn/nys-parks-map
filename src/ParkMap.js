import React, { Component } from "react";
import { GoogleApiWrapper, Map, Marker, InfoWindow } from "google-maps-react";
import "font-awesome/css/font-awesome.min.css";
import { styles } from "./MapStyles";
import "./App.css";

class ParkMap extends Component {
  componentDidMount = () => {
    this.props.findMap(this.refs.map.map);
  }
  
  componentDidUpdate = () => {
    const bounds = new window.google.maps.LatLngBounds();
    const locations = this.props.locations;
    locations
      .filter(filteredlocations => filteredlocations.display)
      .forEach(location => {
        bounds.extend(location.location);
      });
    this.refs.map.map.fitBounds(bounds);
  };

  render() {
    const {
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
        <Map
          ref="map"
          className="map"
          styles={styles}
          google={this.props.google}
          zoom={7}
          initialCenter={{
            lat: 43.0831,
            lng: -73.921
          }}
          onReady={fetchParks}
        >
          {locations.filter(filteredpark => filteredpark.display).map(park => (
            <Marker
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
          <InfoWindow marker={activeMarker} visible={markerVisible}>
            <div className="infowindow">
              <h3>
                {activeMarker.title} {activeMarker.type}
              </h3>
              {placesData.address ? (
                <p className="address">
                  <a href={placesData.mapsUrl} target="_blank">
                    {placesData.address}
                  </a>
                </p>
              ) : (
                <p className="address">Loading park data...</p>
              )}
              {foursquareData.contact &&
                (foursquareData.contact.formattedPhone && (
                  <p className="phone">
                    {foursquareData.contact.formattedPhone}
                  </p>
                ))}
              {foursquareData.rating ? (
                <p className="rating">
                  <a href={foursquareData.foursquareUrl} target="_blank">
                    <i className="fa fa-foursquare" />
                    Rating: {foursquareData.rating} / 10
                  </a>
                </p>
              ) : (
                <p className="rating">
                  <i className="fa fa-foursquare" />
                  No Rating
                </p>
              )}
              <p className="icons">
                {foursquareData.contact &&
                  (foursquareData.contact.twitter && (
                    <a href={foursquareData.contact.twitterUrl} target="_blank">
                      <i className="fa fa-twitter-square" />
                    </a>
                  ))}
                {foursquareData.contact &&
                  (foursquareData.contact.facebook && (
                    <a
                      href={foursquareData.contact.facebookUrl}
                      target="_blank"
                    >
                      <i className="fa fa-facebook-square" />
                    </a>
                  ))}
                {activeMarker.website && (
                  <a href={activeMarker.website} target="_blank">
                    <i className="fa fa-globe" />
                  </a>
                )}
              </p>
            </div>
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyCGnAvu4__n-bl-rsNch6sLTHksCDbWJGg"
})(ParkMap);
