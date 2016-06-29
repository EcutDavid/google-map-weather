import GoogleMapsLoader from 'google-maps'
import request from 'superagent'

import 'styles/app.scss'
import 'normalize.css/normalize.css'

function showWeather(event) {
  const lat = event.latLng.lat()
  const lng = event.latLng.lng()
  request
    .post(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&APPID=fb9810b9aae8ff875f18f073be63bfc5`)
    .send()
    .set('Accept', 'application/json')
    .end((err, res) => {
      console.log(res)
    });
}

const dom = document.getElementById('app')
const options = {
  center: {lat: -34.397, lng: 150.644},
  zoom: 2
}
GoogleMapsLoader.load((google) => {
  const map = new google.maps.Map(dom, options)
  google.maps.event.addListener(map, 'click', showWeather)
})
