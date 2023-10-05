import { state } from '../../stateMamager.js'


export class EventListComponent extends HTMLElement {
  constructor() {
    super()
    this.state = state.getState()
    this.allCrimes = state.getEventNames()
    this.currentRenderList = []
    this.startFrom = 0
 }


  addListeners() {
    const listContainer = document.querySelector('.load-more-button')
    listContainer.addEventListener('click', this.loadMoreEvents.bind(this))
  }
  async connectedCallback() {
    await this.render()
    this.addListeners()

    state.subscribe(async(newState) => {
      this.state = newState
      this.clearHtmlAndReloadVariables()
      await this.renderList()
    })
  }

  clearHtmlAndReloadVariables() {
    const listContainer = document.querySelector('.event-list-wrapper')
    listContainer.innerHTML = ''
    this.startFrom = 0
  }

  createRenderListAllPoints() {
    this.currentRenderList = []
    for (let region in this.state.selectedRegionCrimeAmount) {
      this.state.selectedRegionCrimeAmount[region].forEach((point) => {
        this.currentRenderList.push({...point, region: this.state.selectedRegion || point.region})
      })
    }
    this.currentRenderList = this.currentRenderList.filter(point => point.lat && point.lon)
  }

  createRenderListWithFilterCrimeType(){
    const {  selectedCrimeType } = this.state
    console.log('selectedCrimeType', selectedCrimeType)
    console.log('this.state.selectedRegionCrimeAmount', this.state.selectedRegionCrimeAmount)
    this.currentRenderList = []
    selectedCrimeType.forEach((id) => {
      this.state.selectedRegionCrimeAmount[id].forEach((point) => {
        this.currentRenderList.push({...point, region: this.state.selectedRegion || point.region})
      })
    })
    this.currentRenderList = this.currentRenderList.filter(point => point.lat && point.lon)
  }

  async fetchDataForPoints(points) {
    try {
      const promises = points.map((point, index) => {
        const { lat, lon } = point
        return fetch(`http://api.geonames.org/findNearbyPostalCodes?lat=${lat}&lng=${lon}&username=srgandrsv&type=json`)
          .then(response => response.json())
          .then(data => ({ index, data }))
      })

      const responses = await Promise.all(promises);

      responses.sort((a, b) => a.index - b.index);
      return responses.map(response => response.data);
    } catch (error) {
      console.error('Error fetching data:', error)
      throw error
    }
  }

  async  addCityToPoints(points) {
    const pointsWithCity = [...points]
    const responses = await this.fetchDataForPoints(points)
    console.log(responses)
    for(let i = 0; i< points.length; i++) {
        pointsWithCity[i].city = responses[i]?.postalCodes[0]?.adminName2.concat(', ', responses[i]?.postalCodes[0]?.placeName)  || 'Unknown City'
        pointsWithCity[i].region = responses[i]?.postalCodes[0]?.adminName1
    }

    return pointsWithCity
  }

  async renderList() {
    const listContainer = document.querySelector('.event-list-wrapper')
    const { selectedCrimeType } = this.state

    if (selectedCrimeType.length === 0) {
      this.createRenderListAllPoints()
    }

    if (selectedCrimeType.length !== 0) {
      this.createRenderListWithFilterCrimeType()
    }

    const currentPagePoints = this.currentRenderList.slice(this.startFrom, this.startFrom + 10)
    this.startFrom += 10

    const data = await this.addCityToPoints(currentPagePoints)
    listContainer.innerHTML += this.renderListFromPointArr(data)
  }

  async loadMoreEvents() {
    const listContainer = document.querySelector('.event-list-wrapper')
    const currentPagePoints = this.currentRenderList.slice(this.startFrom, this.startFrom + 10)
    this.startFrom += 10
    const data = await this.addCityToPoints(currentPagePoints)
    listContainer.innerHTML += this.renderListFromPointArr(data)
  }

  renderListFromPointArr(points) {
    return points.map((point) => {
      return `<div class="event">
                    <div class="event-name">${this.allCrimes.affected_type[point.affected_type]}</div>
                    <div class="addition-info-event">
                        <div>
                            <span class="sub-title">Status:</span></br>
                            <span class="main-title">${'unknown'}</span>
                        </div>
                        <div>
                            <span class="sub-title">Region:</span></br>
                            <span class="main-title">${point.region}</span>
                        </div>
                        <div>
                            <span class="sub-title">City / Town:</span></br>
                            <span class="main-title">${point.city}</span>
                        </div>
                        <div>
                            <span class="sub-title">Date of the crime:</span></br>
                            <span class="main-title">${'unknown'}</span>
                        </div>
                    </div>
                    <div class="look-more-button">
                        <img src="../../assets/more-button.svg" alt="more-button">
                    </div>
                </div>`
    }).join('')
  }


  async render() {

    this.innerHTML = `
        <div class="list-wrapper">
            <div class="header-list-event">
              <div class="top-bar-event-list">
                  <span >Help Ukraine</span>
                  <span >Log in</span>
              </div>
            </div>
            <div class="list-wrapper">
                <div class="event-list-wrapper">
                </div>
                <div class="load-more-wrapper">
                    <button class="load-more-button">Load more</button>            
                </div>
            </div>
        </div>
    `
    await this.renderList()
  }
}

customElements.define('event-list-component', EventListComponent)

