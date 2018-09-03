import React, { Component } from 'react';
import ParkMap from './ParkMap';
import FilterOptions from './FilterOptions';
import withOfflineState from 'react-offline-hoc';
import './App.css';

class App extends Component {
  state = {
    error: false,
    locations: [],
    counties: [],
    markers: [],
    foursquareData: {},
    activeMarker: {},
    placesData: {},
    markerVisible: false,
    isOnline: this.props.isOnline,
    loadedOnline: true
  };

  componentDidMount = () => {
    this.setState({
      loadedOnline: this.props.isOnline
    })
  }

  fixMapBounds = () => {
    // Extend bounds and make visible markers fit current bounds
    const bounds = new window.google.maps.LatLngBounds();
    const markers = this.state.markers;
    const map = this.map;
    markers
      .filter(filteredmarkers => filteredmarkers.map !== null)
      .forEach(marker => {
        bounds.extend(marker.getPosition());
      });
    map.fitBounds(bounds);
  };

  findMap = map => {
    this.map = map;
  };

  fetchParks = () => {
    let parks = [];
    let counties = [];
    fetch('https://data.ny.gov/api/views/9uuk-x7vh/rows.json')
      .then(response => response.json())
      .then(parkdata => {
        // Set park data to be pushed to locations state
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
          parkinfo[9] !== 'Other'
            ? (park.type = parkinfo[9])
            : (park.type = '');
          parks.push(park);
        });
        parkdata.meta.view.columns[11].cachedContents.top.forEach(county =>
          counties.push(county.item)
        );
        this.setState({ counties });
        this.setState({ locations: parks });
        this.fixMapBounds();
      })
      .catch(error => {
        console.log(error);
        this.setState({ error: true });
      });
  };

  stopAnimation = () => {
    const prevMarker = this.state.activeMarker;
    Object.keys(prevMarker).length !== 0 && prevMarker.setAnimation(-1);
  };

  closeMobileMenu = () => {
    const filterMenu = document.getElementsByClassName(
      'filter-options-container'
    )[0];
    const filterContent = document.getElementsByClassName('filter-content')[0];
    if (filterMenu.classList.contains('extend')) {
      filterMenu.classList.toggle('extend');
      filterContent.classList.toggle('show');
    }
  };

  fetchParkData = (props, marker) => {
    const lat = marker.getPosition().lat();
    const lng = marker.getPosition().lng();
    this.stopAnimation();
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    // Clear location information for infowindow
    this.setState({
      placesData: {},
      foursquareData: {},
      markerVisible: false,
      activeMarker: {}
    });
    const markerDetails = {};
    // If mobile menu is open, close it
    this.closeMobileMenu();
    this.getPlaces(marker, lat, lng);
    // Fetch Foursquare Data
    fetch(
      `https://api.foursquare.com/v2/venues/search?client_id=4JHXDI1WSAPJJDMNWR3AZHMFZHAVJBBAW3MT3G45US5KXVQS&client_secret=HSVBUXRQSKYB30IJL510PXHA11QOOFTHPHNR1SNSAWO53WJX&v=20180814&ll=${lat},${lng}`
    )
      .then(response => response.json())
      .then(data => {
        const parkid = data.response.venues[0].id;
        // Fetch Foursquare venue details and set Foursquare state
        return fetch(
          `https://api.foursquare.com/v2/venues/${parkid}?client_id=4JHXDI1WSAPJJDMNWR3AZHMFZHAVJBBAW3MT3G45US5KXVQS&client_secret=HSVBUXRQSKYB30IJL510PXHA11QOOFTHPHNR1SNSAWO53WJX&v=20180814`
        )
          .then(details => details.json())
          .then(parkdetails => {
            const venue = parkdetails.response.venue;
            markerDetails.contact = venue.contact;
            markerDetails.contact.twitter &&
              (markerDetails.contact.twitterUrl = `http://www.twitter.com/${
                markerDetails.contact.twitter
              }`);
            markerDetails.contact.facebook &&
              (markerDetails.contact.facebookUrl = `http://www.facebook.com/${
                markerDetails.contact.twitter
              }`);
            markerDetails.foursquareUrl = venue.shortUrl;
            if (venue.rating)
              markerDetails.rating = 'Rating: ' + venue.rating + ' / 10';
            else markerDetails.rating = 'No Rating';
            this.setState({ foursquareData: markerDetails });
          })
          .catch(error => {
            console.log('Unable to load Foursquare venue details: ' + error);
            const errorMessage = {
              contact: {
                formattedPhone: 'Error loading Foursquare venue details'
              }
            };
            this.setState({ foursquareData: errorMessage });
          });
      })
      .catch(error => {
        console.log('Unable to fetch Foursquare Data: ' + error);
        const errorMessage = {
          contact: {
            formattedPhone: 'Error loading Foursquare Data'
          }
        };
        this.setState({ foursquareData: errorMessage });
      })
      .then(() => {
        // Center selected marker on viewport and show infowindow
        this.map.setCenter(marker.getPosition());
        this.setState({
          activeMarker: marker,
          markerVisible: true
        });
      });
  };

  getPlaces = (marker, lat, lng) => {
    // Get address data from Geocoder and update placesData state
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: marker.position }, (results, status) => {
      if (status === 'OK') {
        const placeStats = {
          address: results[0].formatted_address,
          mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${
            results[0].place_id
          }`
        };
        this.setState({ placesData: placeStats });
      } else {
        console.log('Unable to load data from Google Places: ' + status);
        const placeStats = {
          address: 'Address data could not be loaded',
          mapsUrl: null
        };
        this.setState({ placesData: placeStats });
      }
    });
  };

  filterCounty = e => {
    // Filter location list items by county
    const locations = this.state.locations;
    const county = e.target.value;
    const markers = this.state.markers;
    this.closeMobileMenu();
    this.stopAnimation();
    markers.forEach(marker => {
      if (marker.county !== county && county !== 'All Counties') {
        marker.setMap(null);
      } else {
        marker.setMap(this.map);
      }
    });
    this.setState({
      locations,
      markerVisible: false
    });
    this.fixMapBounds();
  };

  pullMarkers = pulledmarker => {
    // Update markers state with currently rendered markers
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
          markers={this.state.markers}
          error={this.state.error}
          counties={this.state.counties}
          fetchParkData={this.fetchParkData}
          filterCounty={this.filterCounty}
          isOnline={this.props.isOnline}
        />
        {!this.state.loadedOnline ? (
          <div className="map-container">
            <div className="map-error">
              <p>You appear to be offline. Please check your connection.</p>
              <p>Unable to load maps.</p>
            </div>
          </div>
        ) : (
          <ParkMap
          findMap={this.findMap}
          fetchParkData={this.fetchParkData}
          fetchParks={this.fetchParks}
          stopAnimation={this.stopAnimation}
          pullMarkers={this.pullMarkers}
          locations={this.state.locations}
          foursquareData={this.state.foursquareData}
          activeMarker={this.state.activeMarker}
          placesData={this.state.placesData}
          markerVisible={this.state.markerVisible}
          isOnline={this.props.isOnline}
          loadedOnline={this.state.loadedOnline}
        />
        )}
      </div>
    );
  }
}

export default withOfflineState(App);
