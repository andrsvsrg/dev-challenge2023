import { events } from './data/events.js'
import { names } from './data/names.js'
import { FILTER_COLORS } from './constants/constants.js'
import { getRadiusByAmount } from './helpers/helpers.js'

class StateManager {
  constructor() {
    this._state = {
      isShowMap: true,
      selectedCrimeType: [],
      selectedRegion: '',
      allEventsToDraw: {},
      selectedRegionCrimeAmount: {
        "19": [],
        "30": [],
        "31": [],
        "32": [],
        "33": [],
        "34": []
      }
    }

    this.allData = events
    this.eventNames = names[0]
    this.regionsName = Object.keys(this.allData)
    this.mergeInfoForFilters()
    this.listeners = [];

    this.groupData()
  }

  mergeInfoForFilters(selectedRegion = '') {

    if(selectedRegion) {
      this.allData[selectedRegion].forEach((event) => {
        if(event?.affected_type){
          this._state.selectedRegionCrimeAmount[event.affected_type].push(event)
        }
      })
    } else {
      this.regionsName.forEach((regionKey) => this.allData[regionKey].forEach((event) => {
        if(event?.affected_type){
          this._state.selectedRegionCrimeAmount[event.affected_type].push(event)
        }
      }))
    }

    return this._state.selectedRegionCrimeAmount
  }

  getRegionsName() {
    return this.regionsName
  }

  getState() {
    return this._state
  }

  getEventNames() {
    return this.eventNames
  }

  clearAllFilters() {
    this._state.selectedCrimeType = []
    this._state.selectedRegion = ''
    this.clearSelectedRegion()
    this.mergeInfoForFilters()
    this.listeners.forEach(listener => {
      listener(this._state)
    })
  }

  clearSelectedRegion() {
    this._state.selectedRegionCrimeAmount = {
      "19": [],
        "30": [],
        "31": [],
        "32": [],
        "33": [],
        "34": []
    }
  }

  groupData() {
    for (let region in this.allData) {
      const eventsOneRegion = this.allData[region]
      const eventsOnRegion = {}
      eventsOneRegion.forEach((e) => {
        if (e.affected_type && Array.isArray(eventsOnRegion[e.affected_type])) {
          eventsOnRegion[e.affected_type].push(e)
        } else if (e.affected_type && !Array.isArray(eventsOnRegion[e.affected_type])) {
          eventsOnRegion[e.affected_type] = [e]
        }
      })


      this._state.allEventsToDraw[region] = []
      for (let key in eventsOnRegion) {
        let center = eventsOnRegion[key].reduce((acc, point) => {
          if (!point.lat || !point.lon) {

            return acc;
          }
          acc.lat += +point.lat;
          acc.lon += +point.lon;
          acc.length += 1

          return acc;
        }, { lat: 0, lon: 0, length: 0, key, region });
        const currentColor = FILTER_COLORS[key]
        const radius = getRadiusByAmount(center.length)
        center = {
          ...center,
          color: currentColor,
          radius,
          lat: center.lat / center.length,
          lon: center.lon / center.length
        }
        this._state.allEventsToDraw[region].push(center)
      }
    }
  }



  setState(newState) {
    this._state = newState
    this.clearSelectedRegion()
    this.mergeInfoForFilters(this._state.selectedRegion)
    this.listeners.forEach(listener => {
      listener(this._state)
    })
  }

  subscribe(listener) {
    this.listeners.push(listener)
  }
}

export const state = new StateManager()





