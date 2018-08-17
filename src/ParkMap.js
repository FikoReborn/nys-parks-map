import React, { Component } from 'react';
import { GoogleApiWrapper, Map, Marker, InfoWindow } from 'google-maps-react';
import './App.css';

class ParkMap extends Component {
    state = {
        locations: [],
        counties: [],
        foursquareData: {},
        activeMarker: {},
        markerVisible: false,
        selectedPark: {}
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

    getPlaces = (map, marker) => {
        const {google} = this.props;
        const geocoder = new google.maps.Geocoder();
        const service = new google.maps.places.PlacesService(map);
        geocoder.geocode({ location: marker.position }, (results, geoStatus) => {
            if (geoStatus === 'OK') {
                service.getDetails({ placeId:results[0].place_id, fields: ['formatted_address', 'url']}, (places, placeStatus) => {
                    if (placeStatus === 'OK') {
                        marker.address = places.formatted_address;
                        marker.mapsUrl = places.url;
                    }
                })
            }
        })
    }

    fetchParkData = (props, marker, e) => {
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
                        console.log(parkdetails)
                        markerDetails.contact = parkdetails.response.venue.contact;
                        markerDetails.rating = parkdetails.response.venue.rating;
                        markerDetails.foursquareUrl = parkdetails.response.venue.shortUrl;
                        this.setState({ foursquareData: markerDetails })
                    })
            })
            .then(this.getPlaces(props.map, marker))
            .then(this.showInfobox(props, marker, e))
    }

    showInfobox = (props, marker, e) => {
        console.log(props)
        this.setState({ 
            activeMarker: marker,
            markerVisible: true
         })
    }
    render() {
        const { locations, counties, selectedPark, activeMarker, foursquareData } = this.state;
        return (
            <Map
                className="map"
                google={this.props.google}
                zoom={7}
                initialCenter={{
                    lat: 43.0831,
                    lng: -73.921
                }}
                onReady={this.fetchParks}
            >
                {locations.map(park => (
                    <Marker
                        key={park.id}
                        title={park.title}
                        type={park.type}
                        position={park.location}
                        website={park.website}
                        county={park.county}
                        animation={window.google.maps.Animation.DROP}
                        visibility={false}
                        onClick={this.fetchParkData} />

                ))}
                <InfoWindow
                    marker={this.state.activeMarker}
                    visible={this.state.markerVisible}>
                    <div className="infowindow">
                        <h3>{activeMarker.title} {activeMarker.type}</h3>
                        <p className="address"><a href={activeMarker.mapsUrl} target="_blank">{activeMarker.address}</a></p>
                        {foursquareData.rating ? (<p class="rating">Rating: {foursquareData.rating} / 10</p>) : (<p class="rating">No Rating</p>)}
                        <p class="icons">
                        {foursquareData.contact && (
                            (foursquareData.contact.formattedPhone) && (<strong>{foursquareData.contact.formattedPhone}</strong>)
                        )}
                        </p>
                    </div>
                </InfoWindow>

            </Map>

        );
    }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyCGnAvu4__n-bl-rsNch6sLTHksCDbWJGg'
})(ParkMap);
