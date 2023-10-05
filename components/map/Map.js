import { state } from '../../stateMamager.js'
import { getCoordinatesInPixels, } from '../../helpers/helpers.js'
import { FILTER_COLORS } from '../../constants/constants.js'

export class MapComponent extends HTMLElement {
  constructor() {
    super()
    this.state = state.getState()
    this.eventNames = state.getEventNames().affected_type
    this.crimeIds = Object.keys(this.eventNames).filter(id => id !== 'All')
  }


  getAllEventsWithCoordinates() {
    const { allEventsToDraw } = this.state
    this.allEventsWithCoordinates = {}
    const offset = [{ x: 20, y: -10 },   //  <-- manually added indents so that in some regions the circles are not all on top of each other.
        { x: 0, y: 25 }, { x: -10, y: 10 }, { x: -20, y: 0 },
        { x: 15, y: 20 }, { x: -25, y: 10 }]

    for (let region in allEventsToDraw) {
        let index = 0
        const regionEventPoints = allEventsToDraw[region]
        this.allEventsWithCoordinates[region] = []
        regionEventPoints.forEach((point) => {
          let newCoordinates = getCoordinatesInPixels(this._canvas.width, this._canvas.height, point.lon, point.lat)
          if (region === 'Kiyivska' || region === 'CHernigivska' ||
            region === 'Sumska' ||
            region === 'Mikolayivska' || region === 'Hersonska') {
            newCoordinates.x += offset[index]?.x
            newCoordinates.y += offset[index]?.y
            index++
          }
          const newPoint = {
            ...point,
            ...newCoordinates
          }
            this.allEventsWithCoordinates[region].push(newPoint)
        })
      }

  }

  drawCircle(x, y, radius, text, color, context, isText) {
    context.save();
    context.globalAlpha = 0.7;
    context.beginPath()
    context.arc(x, y, radius, 0, 2 * Math.PI)
    context.fillStyle = color
    context.fill()
    context.closePath()

    if (radius > 10 && isText) {
      this._context.font = 'bold 12px Arial'
      this._context.fillStyle = 'white'
      this._context.textAlign = 'center'
      this._context.fillText(text, x, y+4)
    }

    if (color === '#1A1A1A') {
      context.strokeStyle = 'white'
      context.lineWidth = 1
      context.stroke()
    }

    context.restore()
  }

  createRegionCircles() {
    const { selectedRegion, selectedCrimeType } = this.state

    if (selectedRegion === '' && selectedCrimeType.length === 0) {
      this.drawAnimatedCircles(this.collectAllPoints())
    }

    if (selectedRegion === '' && selectedCrimeType.length !== 0) {
      this.drawAnimatedCircles(this.collectFilteredPoints(), true)
    }

    if (selectedRegion !== '' && selectedCrimeType.length === 0) {
      this.drawAnimatedCircles(this.collectRegionPoints(), true)
    }

    if (selectedRegion !== '' && selectedCrimeType.length !== 0) {
      this.drawAnimatedCircles(this.collectRegionFilteredPoints(), true)
    }
  }

  collectAllPoints() {
    const allPoints = [];
    for (let region in this.allEventsWithCoordinates) {
      allPoints.push(...this.allEventsWithCoordinates[region])
    }
    return allPoints;
  }

  collectRegionPoints() {
    const {  selectedRegion } = this.state
    const filteredPoints = []
    filteredPoints.push(...this.allEventsWithCoordinates[selectedRegion])
    return filteredPoints;
  }

  collectFilteredPoints() {
    const {  selectedCrimeType } = this.state
    const filteredPoints = [];
    for (let region in this.allEventsWithCoordinates) {
      filteredPoints.push(...this.allEventsWithCoordinates[region].filter(point => selectedCrimeType.includes(point.key)))
    }
    return filteredPoints;
  }

  collectRegionFilteredPoints() {
    const { selectedRegion, selectedCrimeType } = this.state
    return this.allEventsWithCoordinates[selectedRegion].filter(point => selectedCrimeType.includes(point.key))
  }

  drawAnimatedCircles(points, isText) {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = this._context.canvas.width
    tempCanvas.height = this._context.canvas.height
    const tempContext = tempCanvas.getContext('2d')
    tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height)

    points.forEach(point => {
      this.drawCircle(point.x, point.y, 0, point.length, point.color, tempContext, isText)
    });

    this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height)

    const startTime = performance.now()
    const duration = 3000

    const animateCircles = (currentTime) => {
      const elapsedTime = Math.max(currentTime - startTime, 16)
      const progress = elapsedTime / duration

      this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height)

      points.forEach(point => {
        const currentRadius = progress * point.radius
        this.drawCircle(point.x, point.y, currentRadius, point.length, point.color, this._context, isText)
      });

      if (progress < 1) {
        requestAnimationFrame(animateCircles)
      }
    };

    requestAnimationFrame(animateCircles)
  }



  setupCanvas() {
    this._canvas = this.querySelector('.map-container canvas');
    this._canvas.width = this.img.offsetWidth;
    this._canvas.height = this.img.offsetHeight;
    this._context = this._canvas.getContext('2d');
  }

  handleResize() {
    this._canvas.width = this.img.offsetWidth;
    this._canvas.height = this.img.offsetHeight;
    this.getAllEventsWithCoordinates()
    this.createRegionCircles()
  }

  handlerChangeFilter(id) {
    this.state.selectedCrimeType = [id]
    state.setState(this.state)
  }

  addListeners() {
    window.addEventListener('resize', this.handleResize.bind(this));

    const filterPoints = document.querySelectorAll('.filter-point')
    filterPoints.forEach((point) => {
      const id = point.querySelector('.event-text').getAttribute('data-id')
      point.addEventListener('click', this.handlerChangeFilter.bind(this, id))
    })
  }
  connectedCallback() {
    this.render()
    this.img = this.querySelector('.map-container img')
    this.img.onload = () => {
      this.setupCanvas()
      this.getAllEventsWithCoordinates()
      this.createRegionCircles()
      this.addListeners()
    }

    state.subscribe((newState) => {
      this.state = newState
      this.createRegionCircles()

    })
  }



  render() {
    this.innerHTML =
      `<div class="map-container">
        <canvas></canvas>  
        <img src="./assets/ukraine-map.svg" alt="map">    
        <div class="top-bar-login">
            <span>Help Ukraine</span>
            <span>Log in</span>
        </div>
        <div class="footer-bar">
            <div class="points-container">
              ${this.crimeIds.map((id) => {
                  return `
                            <div class="filter-point">
                                  <div style="background-color:${FILTER_COLORS[id]}; border-radius: 50%; width: 12px; height: 12px; padding: 8px; opacity: 0.7;" ></div>
                                  <div data-id='${id}' class="event-text">${this.eventNames[id]}</div>
                            </div>`
                }).join('')}
            </div>
        </div>  
      </div>`
  }
}

customElements.define('map-component', MapComponent)

