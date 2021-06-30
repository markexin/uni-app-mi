import {
  defineAsyncApi,
  API_GET_LOCATION,
  API_TYPE_GET_LOCATION,
  GetLocationProtocol,
  GetLocationOptions,
} from '@dcloudio/uni-api'

import { gcj02towgs84, wgs84togcj02 } from '../../../helpers/location'

function getLocationSuccess(
  type: string,
  position: any,
  resolve: (res: any) => void
) {
  const coords = position.coords
  if (type !== position.coordsType) {
    if (__DEV__) {
      console.log(
        `UNIAPP[location]:before[${position.coordsType}][lng:${coords.longitude},lat:${coords.latitude}]`
      )
    }
    let coordArray
    if (type === 'wgs84') {
      coordArray = gcj02towgs84(coords.longitude, coords.latitude)
    } else if (type === 'gcj02') {
      coordArray = wgs84togcj02(coords.longitude, coords.latitude)
    }
    if (coordArray) {
      coords.longitude = coordArray[0]
      coords.latitude = coordArray[1]
      if (__DEV__) {
        console.log(
          `UNIAPP[location]:after[${type}][lng:${coords.longitude},lat:${coords.latitude}]`
        )
      }
    }
  }

  resolve({
    type,
    altitude: coords.altitude || 0,
    latitude: coords.latitude,
    longitude: coords.longitude,
    speed: coords.speed,
    accuracy: coords.accuracy,
    address: position.address,
    errMsg: 'getLocation:ok',
  })
}

export const getLocation = <API_TYPE_GET_LOCATION>defineAsyncApi(
  API_GET_LOCATION,
  (
    { type = 'wgs84', geocode = false, altitude = false },
    { resolve, reject }
  ) => {
    plus.geolocation.getCurrentPosition(
      (position) => {
        getLocationSuccess(type, position, resolve)
      },
      (e) => {
        // 坐标地址解析失败
        if (e.code === 1501) {
          getLocationSuccess(type, e, resolve)
          return
        }

        reject('getLocation:fail ' + e.message)
      },
      {
        geocode: geocode,
        enableHighAccuracy: altitude,
      }
    )
  },
  GetLocationProtocol,
  GetLocationOptions
)
