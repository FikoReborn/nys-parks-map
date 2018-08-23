import React, { Component } from "react";
import ParkMap from "./ParkMap";
import FilterOptions from "./FilterOptions";
import "./App.css";

class App extends Component {
  state = {
    error: false,
    map: {},
    locations: [],
    counties: [],
    markers: [],
    foursquareData: {},
    activeMarker: {},
    placesData: {},
    markerVisible: false
  };

  findMap = map => {
    this.setState({ map });
  };

  fetchParks = () => {
    let parks = [];
    let counties = [];

    fetch("https://data.ny.gov/api/views/9uuk-x7vh/rows.json")
      .then(response => response.json())
      .then(parkdata => {
        parkdata.data.forEach(parkinfo => {
          let park = {
            id: parkinfo[0],
            title: parkinfo[8],
            county: parkinfo[11],
            website: parkinfo[17][0],
            display: true,
            location: {
              lat: Number(parkinfo[21]),
              lng: Number(parkinfo[20])
            }
          };
          if (parkinfo[9] !== "Other") {
            park.type = parkinfo[9];
          } else {
            park.type = "";
          }
          parks.push(park);
        });
        parkdata.meta.view.columns[11].cachedContents.top.forEach(county => {
          counties.push(county.item);
        });
        this.setState({ counties });
        this.setState({ locations: parks });
      })
      .catch(error => {
        console.log(error);
        this.setState({ error: true });
      });
  };

  fetchParkData = (props, marker) => {
    this.setState({
      placesData: {},
      foursquareData: {}
    });
    const lat = marker.getPosition().lat();
    const lng = marker.getPosition().lng();
    const markerDetails = {};
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    marker.setAnimation(null);
    this.getPlaces(marker, lat, lng);
    fetch(
      `https://api.foursquare.com/v2/venues/search?client_id=4JHXDI1WSAPJJDMNWR3AZHMFZHAVJBBAW3MT3G45US5KXVQS&client_secret=HSVBUXRQSKYB30IJL510PXHA11QOOFTHPHNR1SNSAWO53WJX&v=20180814&ll=${lat},${lng}`
    )
      .then(response => response.json())
      .then(data => {
        const parkid = data.response.venues[0].id;
        return fetch(
          `https://api.foursquare.com/v2/venues/${parkid}?client_id=4JHXDI1WSAPJJDMNWR3AZHMFZHAVJBBAW3MT3G45US5KXVQS&client_secret=HSVBUXRQSKYB30IJL510PXHA11QOOFTHPHNR1SNSAWO53WJX&v=20180814`
        )
          .then(details => details.json())
          .then(parkdetails => {
            markerDetails.contact = parkdetails.response.venue.contact;
            markerDetails.contact.twitter &&
              (markerDetails.contact.twitterUrl = `http://www.twitter.com/${
                markerDetails.contact.twitter
              }`);
            markerDetails.contact.facebook &&
              (markerDetails.contact.facebookUrl = `http://www.facebook.com/${
                markerDetails.contact.twitter
              }`);
            markerDetails.rating = parkdetails.response.venue.rating;
            markerDetails.foursquareUrl = parkdetails.response.venue.shortUrl;
            this.setState({ foursquareData: markerDetails });
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        const errorMessage = {
          contact: {
            formattedPhone: "Error loading Foursquare Data"
          }
        };
        this.setState({ foursquareData: errorMessage });
      })
      .then(this.showInfobox(marker));
  };

  getPlaces = (marker, lat, lng) => {
    const map = this.state.map;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: marker.position }, (results, status) => {
      if (status === "OK") {
        const placeStats = {
          address: results[0].formatted_address,
          mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${
            results[0].place_id
          }`
        };
        this.setState({ placesData: placeStats });
      } else {
        const placeStats = {
          address: "Address data could not be loaded",
          mapsUrl: null
        };
        this.setState({ placesData: placeStats });
      }
    });
  };

  showInfobox = marker => {
    this.setState({
      activeMarker: marker,
      markerVisible: true
    });
  };

  selectMarker = e => {
    const map = this.state.map;
    const markerId = Number(e.target.id);
    const markers = this.state.markers;
    const markerIndex = markers.findIndex(marker => marker.id === markerId);
    this.fetchParkData(map, markers[markerIndex]);
    if (
      document
        .getElementsByClassName("filter-options-container")[0]
        .classList.contains("extend")
    ) {
      document
        .getElementsByClassName("filter-options-container")[0]
        .classList.toggle("extend");
      document
        .getElementsByClassName("list-locations")[0]
        .classList.toggle("show");
    }
  };

  filterCounty = e => {
    const locations = this.state.locations;
    const county = e.target.value;
    locations.forEach(location => {
      if (location.county !== county && county !== "All Counties") {
        location.display = false;
      } else {
        location.display = true;
      }
    });
    this.setState({ locations });
    this.setState({ markerVisible: false });
  };

  pullMarkers = pulledmarker => {
    if (this.state.markers.length === 0) {
      this.setState(state => ({
        markers: [...state.markers, pulledmarker.marker]
      }));
    }
  };

  render() {
    return (
      <div className="App">
        <div className="app-title">
          <h1>New York State Parks Map</h1>
        </div>
        <FilterOptions
          error={this.state.error}
          selectMarker={this.selectMarker}
          counties={this.state.counties}
          locations={this.state.locations}
          filterCounty={this.filterCounty}
        />
        <ParkMap
          findMap={this.findMap}
          pullMarkers={this.pullMarkers}
          fetchParks={this.fetchParks}
          fetchParkData={this.fetchParkData}
          getPlaces={this.getPlaces}
          showInfobox={this.showInfobox}
          locations={this.state.locations}
          foursquareData={this.state.foursquareData}
          activeMarker={this.state.activeMarker}
          placesData={this.state.placesData}
          markerVisible={this.state.markerVisible}
        />
      </div>
    );
  }
}

export default App;
