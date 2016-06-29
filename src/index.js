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
let infowindow = undefined

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
    if (!infowindow) {
      infowindow = new google.maps.InfoWindow({
        content: generateContentStr('<h3>Loading Weather data......</</h3>')
      })
    } else {
      infowindow.setContent('<h3>Loading Weather data......</h3>')
    }
    infowindow.open(map, marker)

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

      infowindow.setContent(generateContentStr(name, description, temp))
    })
  }
  google.maps.event.addListener(map, 'click', showWeather)
}

const dom = document.getElementById('app')
const options = {
  center: { lat: -34.397, lng: 150.644 },
  zoom: 3
}
GoogleMapsLoader.KEY = 'AIzaSyBGzmkd6vVoLbnULUrXOHynKsScQu6DUT4'
GoogleMapsLoader.load(google => {
  const map = new google.maps.Map(dom, options)
  initMap(google, map)
})
