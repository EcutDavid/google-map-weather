import GoogleMapsLoader from 'google-maps'
import request from 'superagent'

import 'styles/app.scss'
import 'normalize.css/normalize.css'
import { kelvinToFahren, kelvinToCels } from './helper/temperature'

function generateContentStr(name, description, temp) {
  return `
    <div style="text-align: center" id="content">
      <h1 style="color: skyblue" class="title">${name}</h1>
      <p>${description ? description : ''}</p>
      <p>${temp ? kelvinToFahren(temp).toFixed(2) + ' °F': ''}</p>
      <p>${temp ? kelvinToCels(temp).toFixed(2) + ' °C' : ''}</p>
    </div>
  `
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
    const defaultWindow = new google.maps.InfoWindow({
      content: '<h3>Weather data is loading</h3>'
    })
    defaultWindow.open(map, marker)
    requestData(lat, lng, data => {
      const {
        name,
        weather,
        main: {
          temp_max,
          temp_min,
          temp
        }
      } = data
      const description = typeof weather === 'object' ?
        (weather[0] ?  weather[0].description : undefined ) :
        undefined

      const infowindow = new google.maps.InfoWindow({
        content: generateContentStr(name, description, temp)
      })
      defaultWindow.close()
      infowindow.open(map, marker)
    })
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
