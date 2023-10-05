
import { state } from '../../stateMamager.js'
class App extends HTMLElement {
  constructor() {
    super();
    this.state = state.getState()
    this.isShowMap =  this.state.isShowMap
  }



  connectedCallback() {
    this.render()

    state.subscribe((newState) => {
      if(this.isShowMap !== newState.isShowMap) {
        this.isShowMap = newState.isShowMap
        this.render()
      }
    })

  }

  render() {
    this.innerHTML = state.getState().isShowMap ? '<map-component></map-component>' : '<event-list-component></event-list-component>'
  }
}

customElements.define('main-screen', App);