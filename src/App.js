import React, { Component } from 'react';
import ParkMap from './ParkMap';
import './App.css';

class App extends Component {
  state = {
    locations: [],
    counties: [],
    foursquareData: {},
    activeMarker: {},
    placesData: {},
    markerVisible: false
}

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
            parkdata.meta.view.columns[11].cachedContents.top.forEach(
                county => {
                    counties.push(county.item);
                }
            );
            this.setState({ counties });
            this.setState({ locations: parks });
        })
}

fetchParkData = (props, marker, e) => {
    this.setState({
        placesData: {},
        foursquareData: {},
    })
    const lat = marker.getPosition().lat();
    const lng = marker.getPosition().lng();
    const markerDetails = {};
    fetch(`https://api.foursquare.com/v2/venues/search?client_id=4JHXDI1WSAPJJDMNWR3AZHMFZHAVJBBAW3MT3G45US5KXVQS&client_secret=HSVBUXRQSKYB30IJL510PXHA11QOOFTHPHNR1SNSAWO53WJX&v=20180814&ll=${lat},${lng}`)
        .then(response => response.json())
        .then(data => {
            const parkid = data.response.venues[0].id;
            return fetch(`https://api.foursquare.com/v2/venues/${parkid}?client_id=4JHXDI1WSAPJJDMNWR3AZHMFZHAVJBBAW3MT3G45US5KXVQS&client_secret=HSVBUXRQSKYB30IJL510PXHA11QOOFTHPHNR1SNSAWO53WJX&v=20180814`)
                .then(details => details.json())
                .then(parkdetails => {
                    markerDetails.contact = parkdetails.response.venue.contact;
                    markerDetails.contact.twitter && (markerDetails.contact.twitterUrl = `http://www.twitter.com/${markerDetails.contact.twitter}`);
                    markerDetails.contact.facebook && (markerDetails.contact.facebookUrl = `http://www.facebook.com/${markerDetails.contact.twitter}`);
                    markerDetails.rating = parkdetails.response.venue.rating;
                    markerDetails.foursquareUrl = parkdetails.response.venue.shortUrl;
                    this.setState({ foursquareData: markerDetails })
                    this.getPlaces(props.map, marker)
                })
        })
        .then(this.showInfobox(props, marker, e))
}

getPlaces = (map, marker) => {
    const geocoder = new window.google.maps.Geocoder();
    const service = new window.google.maps.places.PlacesService(map);
    geocoder.geocode({ location: marker.position }, (results, geoStatus) => {
        if (geoStatus === 'OK') {
            service.getDetails({ placeId:results[0].place_id, fields: ['formatted_address', 'url']}, (places, placeStatus) => {
                if (placeStatus === 'OK') {
                    const placeStats = {
                        address: places.formatted_address,
                        mapsUrl: places.url
                    }
                    this.setState({placesData:placeStats})
                }
            })
        }
    })
}

showInfobox = (props, marker, e) => {
    this.setState({ 
        activeMarker: marker,
        markerVisible: true
     })
}

  render() {
    return (
      <div className="App">
        <ParkMap
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
