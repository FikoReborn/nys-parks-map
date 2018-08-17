import React, { Component } from 'react';
import { GoogleApiWrapper, Map, Marker, InfoWindow } from 'google-maps-react';
import 'font-awesome/css/font-awesome.min.css';
import './App.css';

class ParkMap extends Component {
    state = {
        locations: [],
        counties: [],
        foursquareData: {},
        activeMarker: {},
        placesData: {},
        markerVisible: false
    }
    fetchParks = () => {
        console.log(this)
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
                        console.log(parkdetails.response.venue.contact)
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
        const {google} = this.props;
        const geocoder = new google.maps.Geocoder();
        const service = new google.maps.places.PlacesService(map);
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
        console.log(props)
        this.setState({ 
            activeMarker: marker,
            markerVisible: true
         })
    }
    render() {
        const { locations, counties, selectedPark, activeMarker, foursquareData, placesData } = this.state;
            // Style made by Aiziel Nazario and posted to snazzymaps.com
    // https://snazzymaps.com/style/137900/green
    const styles = [
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [
            {
              color: "#ffffff"
            }
          ]
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [
            {
              visibility: "on"
            },
            {
              color: "#3e606f"
            },
            {
              weight: 2
            },
            {
              gamma: 0.84
            }
          ]
        },
        {
          featureType: "all",
          elementType: "labels.icon",
          stylers: [
            {
              visibility: "off"
            }
          ]
        },
        {
          featureType: "administrative",
          elementType: "geometry",
          stylers: [
            {
              weight: 0.6
            },
            {
              color: "#313536"
            }
          ]
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [
            {
              color: "#44a688"
            }
          ]
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [
            {
              color: "#13876c"
            }
          ]
        },
        {
          featureType: "poi.attraction",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#f5e4e4"
            },
            {
              visibility: "off"
            }
          ]
        },
        {
          featureType: "poi.attraction",
          elementType: "labels",
          stylers: [
            {
              visibility: "on"
            },
            {
              lightness: "14"
            }
          ]
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [
            {
              color: "#13876c"
            },
            {
              visibility: "simplified"
            }
          ]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [
            {
              color: "#067372"
            },
            {
              lightness: "-20"
            }
          ]
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [
            {
              color: "#357374"
            }
          ]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [
            {
              color: "#0c4174"
            }
          ]
        }
      ];
        return (
            <Map
                className="map"
                styles={styles}
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
                        {placesData.address ? (<p className="address"><a href={placesData.mapsUrl} target="_blank">{placesData.address}</a></p>) : (<p className="address">Loading park data...</p>)}
                        {foursquareData.contact && (
                            foursquareData.contact.formattedPhone && (<p className="phone">{foursquareData.contact.formattedPhone}</p>)   
                        )}
                        {foursquareData.rating ? (<p className="rating"><a href={foursquareData.foursquareUrl} target="_blank"><i className="fa fa-foursquare"></i>Rating: {foursquareData.rating} / 10</a></p>) : (<p className="rating"><i className="fa fa-foursquare"></i>No Rating</p>)}
                        <p className="icons">
                        {foursquareData.contact && (
                            foursquareData.contact.twitter && (<a href={foursquareData.contact.twitterUrl} target="_blank"><i className="fa fa-twitter-square"></i></a>)
                        )}
                        {foursquareData.contact && (
                            foursquareData.contact.facebook && (<a href={foursquareData.contact.facebookUrl} target="_blank"><i className="fa fa-facebook-square"></i></a>)
                        )}
                        {activeMarker.website && (<a href={activeMarker.website} target="_blank"><i className="fa fa-globe"></i></a>)}
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
