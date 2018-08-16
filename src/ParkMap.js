import React, { Component } from 'react';
import { GoogleApiWrapper, Map } from 'google-maps-react';
import './App.css';

class ParkMap extends Component {
    state = {
        locations: [],
        counties: []
    }
    fetchParks= () => {
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
            });
    }
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
                onReady={this.fetchParks}
            >

            </Map>

        );
    }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyCGnAvu4__n-bl-rsNch6sLTHksCDbWJGg'
})(ParkMap);
