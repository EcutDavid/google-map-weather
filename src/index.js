import GoogleMapsLoader from 'google-maps'
import request from 'superagent'

import 'styles/app.scss'
import 'normalize.css/normalize.css'

const contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
      '</div>'+
      '</div>'

function generateContentStr() {

}

function requestData(lat, lng, next) {
  request
    .post(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&APPID=fb9810b9aae8ff875f18f073be63bfc5`)
    .send()
    .set('Accept', 'application/json')
    .end((err, res) => {
      if (err) {
        return
      }
      next(res.body)
    })
}

let oldMarker = undefined

function initMap(google, map) {
  const showWeather = event => {
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()
    if (oldMarker) {
      oldMarker.setMap(null)
    }
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map
    })
    oldMarker = marker
    const infowindow = new google.maps.InfoWindow({
      content: contentString
    })
    infowindow.open(map, marker)
    requestData(lat, lng, console.log)
  }
  google.maps.event.addListener(map, 'click', showWeather)
}

const dom = document.getElementById('app')
const options = {
  center: { lat: -34.397, lng: 150.644 },
  zoom: 2
}
GoogleMapsLoader.load(google => {
  const map = new google.maps.Map(dom, options)
  initMap(google, map)
})
