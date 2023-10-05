import { state } from '../../stateMamager.js'

export class HeaderComponent extends HTMLElement {
  constructor() {
    super();
    this.state = state.getState()
  }
  handlerClick() {
    this.state.isShowMap = !this.state.isShowMap
    state.setState(this.state)
  }

  addListeners() {
    const button = document.querySelector('.menu-button')
    button.addEventListener('click', this.handlerClick.bind(this))
  }

  connectedCallback() {
    this.render()
    this.addListeners()
  }

  render() {
    this.innerHTML = `
      <div class="menu-container">
         <div class="coatofarms-container">
            <img src="../../assets/coat_of_arms.svg" alt="coat of arms">
         </div>
         <div class="menu-location">
            <div>
                <img src="../../assets/location.svg" alt="location">
            </div>
            <div class="menu-button" >
                <img src="../../assets/menu.svg" alt="menu">
            </div>
            <span style="width: 20px; height: 20px;"> </span>                   
         </div>
         <div class="download-pdf-button">
           <div>
                <img src="../../assets/download_pdf.svg" alt="download_pdf">
            </div>
         </div>
      </div>`
  }
}

customElements.define('header-component', HeaderComponent);