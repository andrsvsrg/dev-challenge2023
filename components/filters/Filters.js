import { state } from '../../stateMamager.js'

export class FiltersComponent extends HTMLElement {
  constructor() {
    super()
    this.state = state.getState()
    this.eventNames =  state.getEventNames()
    this.regionsName = state.getRegionsName()
    this.selectedCrimeType = []
    this.selectedRegion = ''
  }

  updateRender() {
    const checkboxes = this.checkboxes.querySelectorAll('.checkbox-container')
    let totalAmount = 0
    checkboxes.forEach((checkbox) => {
      const input = checkbox.querySelector('input[type="checkbox"]')
      const number = checkbox.querySelector('.number')
      const id = input.id
      if(id === 'All') {
        number.innerHTML = totalAmount
        if(this.state.selectedCrimeType.length !== 6) {
          input.checked = false
        }
        return
      } else{
        input.checked = this.state.selectedCrimeType.includes(id)
      }

      totalAmount += this.state.selectedRegionCrimeAmount[id].length
      number.innerHTML = this.state.selectedRegionCrimeAmount[id].length
    })
    this.setSelectedElementsDownTab()
    this.updateRegionValue()
    this.updateTotalShowResult()
  }

  updateTotalShowResult() {
    const ids = this.state.selectedCrimeType   // ids
    const totalResults = ids.reduce((acc, id) => {
      return acc += this.state.selectedRegionCrimeAmount[id].length
    }, 0)
    const countContainer = document.querySelector('.result-count')
    const numberAll = document.querySelectorAll('.number')
    countContainer.innerHTML = totalResults || numberAll[numberAll.length - 1].innerHTML
  }

  updateRegionValue() {
    const selectedRegion = document.querySelector('.select-header')
    selectedRegion.innerHTML = this.state.selectedRegion || 'All States'
  }

  createCheckboxes() {
    this.checkboxes = document.querySelector('.checkboxes-flex')
    const affectedTypesObj = this.eventNames.affected_type
    affectedTypesObj['All'] = 'All'
    const checkboxesId =Object.keys(affectedTypesObj)
    let totalAmount = 0
    this.checkboxes.innerHTML += checkboxesId.map((id ) => {
      totalAmount += +this.state.selectedRegionCrimeAmount[id]?.length || 0
      return `
         <div class="checkbox-container">
                  <input type="checkbox" id="${id}">
                  <label for="${id}">${affectedTypesObj[id]}</label>
                  <span class="number">${this.state.selectedRegionCrimeAmount[id]?.length || totalAmount || 0}</span>
         </div>`
    } ).join('')
  }

  createSelectRegions() {
    const selectOptions = this.regionsName;
    const selectContainer = document.querySelector('.custom-select .select-options');
    const selectedHeader = document.querySelector('.select-header')
    selectOptions.forEach(optionText => {
      const optionElement = document.createElement('div');
      optionElement.classList.add('option');
      optionElement.textContent = optionText;
      optionElement.addEventListener('click', (event) => {
        event.stopPropagation();
        this.state.selectedRegion = optionText
        state.setState(this.state)
        selectedHeader.innerText = optionText
        selectContainer.classList.remove('active');
      });
      selectContainer.appendChild(optionElement);
    });
  }

  async connectedCallback() {
    await this.render()
    this.createCheckboxes()
    this.createSelectRegions()
    this.setSelectedElementsDownTab()
    this.updateTotalShowResult()

    state.subscribe((newState) => {
      this.getUpdatedState(newState)
      this.updateRender()
    })
    this.addListeners()
  }


  setSelectedElementsDownTab() {
    const container = document.querySelector('.selected-filters-down')
    container.innerHTML = ''
    const selectedCrimeIds = this.state.selectedCrimeType
    selectedCrimeIds.forEach((id) => {
      const crimeNameSelected = this.eventNames.affected_type[id]
      const div = document.createElement('div')
      div.classList.add('selected-filter-element')
      div.innerHTML = crimeNameSelected
      container.appendChild(div)
    })

    const div = document.createElement('div')
    div.classList.add('selected-filter-element')
    div.innerHTML = this.state.selectedRegion || 'All States'
    container.appendChild(div)

  }


  getUpdatedState(newState) {
    this.state = newState;
  }

  checkboxesHandler(checkboxes, event) {
    if (event.target.checked) {
      if(event.target.id === 'All') {
        this.state.selectedCrimeType = []
        checkboxes.forEach((checkbox) =>  {
          this.state.selectedCrimeType.push(checkbox.id)
        })
        this.state.selectedCrimeType =  this.state.selectedCrimeType.filter(e => e!== 'All')
        state.setState(this.state)
        return
      }
      this.state.selectedCrimeType.push(event.target.id)
      state.setState(this.state)
    } else {
      if(event.target.id === 'All') {
        checkboxes.forEach((checkbox) => {
          this.state.selectedCrimeType.push(checkbox.id)
        })
        this.state.selectedCrimeType = []
        state.setState(this.state)
        return
      }
      this.state.selectedCrimeType = this.state.selectedCrimeType.filter(el => el !== event.target.id)
      state.setState(this.state)
    }
  }

  addListeners() {
    const selectContainer = document.querySelector('.custom-select .select-options');
    const selectHeader = document.querySelector('.custom-select');
    const buttonClearFilters = document.querySelector('.clear-filters-button');
    selectHeader.addEventListener('click', () => {
      selectContainer.classList.toggle('active');
    });

    buttonClearFilters.addEventListener('click', () =>{
      state.clearAllFilters()
      this.updateRender()
      const input = document.querySelector('input[type="checkbox"][id="All"]')
      input.checked = false;
    })

    document.addEventListener('click', event => {
      if (!selectContainer.contains(event.target) && !selectHeader.contains(event.target)) {
        selectContainer.classList.remove('active');
      }
    });

    const checkboxes = document.querySelectorAll('.checkboxes-flex input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', this.checkboxesHandler.bind(this, checkboxes));
    });
  }

  render() {
    this.innerHTML = `
      <div class="filters-container">
        <div class="top-bar"> 
            <div class="search-input">
                 <i class="icon-search"></i>
                 <input type="text" placeholder="Search">      
            </div>
            <div class="filter-icon-block">
               <i class="filter-icon"></i>
               <span class="filter-icon-text">Filters</span>
            </div>
        </div>      
        <div class="filters-checkbox-container">
            <div class="header">
                <h2>Filters</h2>
            </div>
            <div class="checkboxes">
              <h3 class="subtitle">
                  Crime Type
              </h3>
              <div class="checkboxes-flex">             
              </div>   
            </div>          
            <h3 class="region-header">
                Region
            </h3>
            <div class="selects">
                <div class="custom-select">
                  <div class="select-header">
                    All States
                  </div>
                  <div class="select-options">   
                  </div>
                </div>
            </div>            
            <div class="city-select-block">
              <h3 class="city-header">
                City / Town
              </h3>
              <div class="custom-select">
                  <div class="select-header">
                    All City  
                  </div>
<!--                   Data about cities is not included in the attached data, they must be provided because free APIs that -->
<!--                   return a city from coordinates do not provide access for events in the amount of 20 thousand+.-->
                  <div class="select-options">
                  </div>
              </div>
            </div>            
            <div class="result-block">
              <span class="text-result">
                Result:
              </span>
               <span class="result-count">555</span>
            </div>     
            <div class="selected-filters-down">
                <div class="selected-filter-element">
                    element
                </div>
            </div>
            <div class="clear-filters-button">
                <img src="./assets/cross-icon.svg" alt="cross svg">
                Clear All Filters
            </div>
            
        </div> 
      </div>`
  }
}

customElements.define('filters-component', FiltersComponent)
