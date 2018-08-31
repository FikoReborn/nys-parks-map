# Udacity Neighborhood Map React Project


## Overview

This is a project through the Udacity Front-end Nanodegree Program. This application utilizes the Google Maps JavaScript API to display a list of filterable locations on a map. I have decided to pull all New York State Parks from a database of park locations and information on [Open NY](https://data.ny.gov/). 

## How to Run

Either try the online version of the app, [here](http://www.aduff.org/nys-parks-map) or follow the instructions below:

**Development Mode**

In your console, after navigating to the desired folder you wish to clone the project to, enter the following:

1. `git clone https://github.com/FikoReborn/nys-parks-map.git`
2. `npm install` to install all required dependencies from package.json
3. `npm start` to start the development server

Navigate to `http://localhost:3000` to run the app. 

**Production Mode** 

Same as above, clone to your machine using the instructions above, then in your console, enter:

1. `npm run build`
2. (if serve is not installed) `npm install -g serve`
3. `serve -s build` to start the production server

The app will now be available by navigating to `http://localhost:5000`.

## Instructions

Upon loading, all markers for New York State Park locations should be visible on the map. By clicking on a specific marker, it will pull up an info window showing basic park information, as well as information puled from the [Foursquare API](https://developer.foursquare.com/). 

On the left hand side of the page is a list of currently displayed locations as well as a drop-down menu that will allow you to filter the displayed locations on the map by county.  Click on any county, and it will update the locations shown on the map, as well as the locations on the list below.  Clicking on any location on the list will also pull up its respective info window. 

## Credit

As mentioned above, park information is pulled from [Open NY](https://data.ny.gov/), while detailed info such as rating and social media profiles are pulled from the [Foursquare API](https://developer.foursquare.com/). 