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

  stopAnimation = () => {
    const prevMarker = this.state.activeMarker;
    (Object.keys(prevMarker).length !== 0) && (prevMarker.setAnimation(null));
  }

  fetchParkData = (props, marker) => {
    this.stopAnimation();
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    this.setState({
      placesData: {},
      foursquareData: {},
      markerVisible: false,
      activeMarker: {}
    });
    const lat = marker.getPosition().lat();
    const lng = marker.getPosition().lng();
    const markerDetails = {};
    if (document.getElementsByClassName("filter-options-container")[0].classList.contains("extend")) {
        document.getElementsByClassName("filter-options-container")[0].classList.toggle("extend");
        document.getElementsByClassName("list-locations")[0].classList.toggle("show");
      }
    this.getPlaces(marker, lat, lng);
    fetch(`https://api.foursquare.com/v2/venues/search?client_id=4JHXDI1WSAPJJDMNWR3AZHMFZHAVJBBAW3MT3G45US5KXVQS&client_secret=HSVBUXRQSKYB30IJL510PXHA11QOOFTHPHNR1SNSAWO53WJX&v=20180814&ll=${lat},${lng}`)
      .then(response => response.json())
      .then(data => {
        const parkid = data.response.venues[0].id;
        return fetch(`https://api.foursquare.com/v2/venues/${parkid}?client_id=4JHXDI1WSAPJJDMNWR3AZHMFZHAVJBBAW3MT3G45US5KXVQS&client_secret=HSVBUXRQSKYB30IJL510PXHA11QOOFTHPHNR1SNSAWO53WJX&v=20180814`)
          .then(details => details.json())
          .then(parkdetails => {
            const venue = parkdetails.response.venue;
            markerDetails.contact = venue.contact;
            markerDetails.contact.twitter && (markerDetails.contact.twitterUrl = `http://www.twitter.com/${markerDetails.contact.twitter}`);
            markerDetails.contact.facebook && (markerDetails.contact.facebookUrl = `http://www.facebook.com/${markerDetails.contact.twitter}`);
            markerDetails.foursquareUrl = venue.shortUrl;
            if (venue.rating) markerDetails.rating = 'Rating: ' + venue.rating + ' / 10';
            else markerDetails.rating = 'No Rating';
            this.setState({ foursquareData: markerDetails });
          })
          .catch(error => {
            console.log('Unable to load Foursquare venue details: ' + error);
            const errorMessage = {
                contact: {
                  formattedPhone: "Error loading Foursquare venue details"
                }
              };
              this.setState({ foursquareData: errorMessage })
          });
      })
      .catch(error => {
        console.log('Unable to fetch Foursquare Data: ' + error);
        const errorMessage = {
          contact: {
            formattedPhone: "Error loading Foursquare Data"
          }
        };
        this.setState({ foursquareData: errorMessage });
      })
      .then(() => {
        this.state.map.setCenter(marker.getPosition());
        this.setState({
            activeMarker: marker,
            markerVisible: true
        })
      });
  };

  getPlaces = (marker, lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: marker.position }, (results, status) => {
      if (status === "OK") {
        const placeStats = {
          address: results[0].formatted_address,
          mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${results[0].place_id}`
        };
        this.setState({ placesData: placeStats });
      } else {
        console.log('Unable to load data from Google Places: ' + status)
        const placeStats = {
          address: "Address data could not be loaded",
          mapsUrl: null
        };
        this.setState({ placesData: placeStats });
      }
    });
  };

  selectMarker = e => {
    const map = this.state.map;
    const markerId = Number(e.target.id);
    const markers = this.state.markers;
    const markerIndex = markers.findIndex(marker => marker.id === markerId);
    this.fetchParkData(map, markers[markerIndex]);
  };

  filterCounty = e => {
    const locations = this.state.locations;
    const county = e.target.value;
    this.stopAnimation();
    locations.forEach(location => {
      if (location.county !== county && county !== "All Counties") {
        location.display = false;
      } else {
        location.display = true;
      }
    });
    this.setState({ 
        locations,
        markerVisible: false
     });
  };

  pullMarkers = pulledmarker => {
    if (this.state.markers.length === 0) {
      this.setState(state => ({
        markers: [...state.markers, pulledmarker.marker]
      }));
    }
  };

  menuOpen = () => {
    document.getElementsByClassName('filter-options-container')[0].classList.toggle("extend");
    document.getElementsByClassName('list-locations')[0].classList.toggle("show");
  }

  render() {
    return (
      <div className="App">
        <div className="app-title">
          <h1>New York State Parks Map</h1>
        </div>
        <FilterOptions
          menuOpen={this.menuOpen}
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
