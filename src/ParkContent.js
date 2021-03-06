import React from 'react';
import 'font-awesome/css/font-awesome.min.css';
import Foursquare from './img/Foursquare.png';
import './App.css';

function ParkContent(props) {
  const { activeMarker, foursquareData, placesData } = props;
  return (
    <aside className="infowindow">
      <h3 id="park-title">
        {activeMarker.title} {activeMarker.type}
      </h3>
      {placesData.address ? (
        <p className="address">
          <a href={placesData.mapsUrl} target="_blank">
            {placesData.address}
          </a>
        </p>
      ) : (
        <p className="address">Loading address data...</p>
      )}
      {Object.keys(foursquareData).length === 0 && (
        <p>Loading Foursquare data...</p>
      )}
      {foursquareData.contact &&
        (foursquareData.contact.formattedPhone && (
          <p className="phone">{foursquareData.contact.formattedPhone}</p>
        ))}
      {foursquareData.rating && (
        <p className="rating">
          <a href={foursquareData.foursquareUrl} target="_blank">
            <i className="fa fa-foursquare" />
            {foursquareData.rating}
          </a>
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
            <a href={foursquareData.contact.facebookUrl} target="_blank">
              <i className="fa fa-facebook-square" />
            </a>
          ))}
        {activeMarker.website && (
          <a href={activeMarker.website[0]} target="_blank">
            <i className="fa fa-globe" />
          </a>
        )}
      </p>
      <a href="http://www.foursquare.com">
        <img
          src={Foursquare}
          className="foursquare-logo"
          alt="Powered by Foursquare"
        />
      </a>
    </aside>
  );
}

export default ParkContent;
