import { EASTERN_UKR_POINT, LOWER_UKR_POINT, UPPER_UKR_POINT, WESTERN_UKR_POINT } from '../constants/constants.js'



const allHeightInDegrees = UPPER_UKR_POINT - LOWER_UKR_POINT  // 52.379167 - 44.141944 =  8,237223
const allWidthInDegrees = EASTERN_UKR_POINT - WESTERN_UKR_POINT  // 40.159722 - 22.137222 =  18,0225


export function getCoordinatesInPixels(mapWidth, mapHeight, lon, lat) {
  mapWidth = mapWidth * 0.9 // - 10% margins
  mapHeight = mapHeight * 0.9  // - 10% margins

  const heightCoordinates = allHeightInDegrees / mapHeight
  const widthCoordinates = allWidthInDegrees / mapWidth

  const newLat = (UPPER_UKR_POINT - lat) / heightCoordinates
  const newLon = (lon - WESTERN_UKR_POINT) / widthCoordinates


  return {x: newLon, y: newLat}
}


export function getRadiusByAmount(length) {
  const radiusByAmount = {
    100: 10,
    300: 15,
    500: 20,
    750: 25,
    1000: 30,
    1500: 35,
    2000: 40,
    2500: 45
  }

  const keys = Object.keys(radiusByAmount).map((e) => +e).sort((a, b) => a - b)
  let closestRadius = radiusByAmount[keys[0]]

  for (let i = 1; i < keys.length; i++) {
    if (length >= keys[i - 1] && length <= keys[i]) {
      closestRadius = radiusByAmount[keys[i]]
      break;
    }
  }

  return closestRadius;
}


