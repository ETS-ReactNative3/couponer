import React, { Component } from 'react';
import './search.css';
import Select from '../SubComponents/Select/select';
import CouponsMaker from '../../couponsMaker';
// Private component, keep scoped to search component
class SearchField extends Component {
  render() {
    return (
      <div className="searchBox">
      <div className='searchLabel'>
      <label className='signupLabel' htmlFor={this.props.htmlFor}>
        <strong>{this.props.htmlFor}</strong>
      </label>
      </div>
      <input className={this.props.className} type="text" name={this.props.name} placeholder={this.props.placeholder} onChange={this.props.onChange}/>
    </div>
    )
  }
}

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      city: '',
      zip: '',
      category: '',
      coupons: '',
      keywords: '',
      recaptchaToken: '',
      pageNumber: 1,
      incrementPageClass: "hidden"
    }
    this.updateCategory = this.updateCategory.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.decreasePage = this.decreasePage.bind(this);
    this.incrementPage = this.incrementPage.bind(this);
    this.CouponsMaker = this.CouponsMaker.bind(this)
  }
  componentDidMount() { }
  async decreasePage(){
    const pageNumber = this.state.pageNumber;
    if (pageNumber > 1) {
      const url = '/api/getSponseredCoupons/'+this.state.city+'/'+(this.state.pageNumber-1)
      const response = await fetch(url);
      const data = await response.json();
      this.setState({coupons: this.CouponsMaker(data.coupons), incrementPageClass: "center"})
    }
    else alert("You cannot go lower than page one!")
  }
  async incrementPage(){
    this.setState({pageNumber : (this.state.pageNumber + 1)})
    const url = '/api/getSponseredCoupons/'+this.state.city+'/'+(this.state.pageNumber+1)
    const response = await fetch(url);
    const data = await response.json();
    this.setState({coupons: this.CouponsMaker(data.coupons), incrementPageClass: "center"})
  }
  CouponsMaker = (props) => {
    try {
      const content = props.map((coupons) =>
      <div className="coupon" id={coupons._id}>
      <h1 className = "exampleTitle">{coupons.title}</h1>
      <img  className = "exampleImage" src={coupons.base64image} alt="Example showing how your custom upload will appear on the coupon"/>
      <div className="pricing">
        <div className='oldPrice'>
            Was: {(coupons.currentPrice - 0).toFixed(2)}$
        </div>
        <div className='percentOff'>
            {(((coupons.currentPrice - coupons.discountedPrice)/coupons.currentPrice)*100).toFixed(2)}% Percent Off!
        </div>
        <br/>
        <div className='newPrice'>
            Now: {(coupons.discountedPrice - 0).toFixed(2)}$
        </div>
        <div className='savings'>
            Save: {(coupons.currentPrice - coupons.discountedPrice).toFixed(2)}$
        </div>
        <br/>
        <hr/>
        <div className="amountLeft">
            Only {coupons.amountCoupons} Coupons Left!
        </div>
      <hr/>
      <div className="description">
      <br/>
        <p>{coupons.textarea}</p>
        <br/>
        <hr/>
        <br/>
        <p>{coupons.address}</p>
        <hr/>
        <br/>
        <button className="getCoupon" onClick={this.getCoupons.bind(this, coupons._id)}> Get Coupon </button>
      </div>
      <br/>
    </div>
  </div>
      );
      return (
      <div className='flextape'>
          {content}
        </div>
      );
    } catch (error) {
      return (
      <div className='center'>
      <br/>
      <h3>Unable to automatically search for coupons. Try searching manually.</h3>
      </div>
      )
    }
  }
  handleChange = (event) => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }
  updateCategory (e) {
    const choices = ["Food", "Entertainment", "Health and Fitness", "Retail", "Home Improvement", "Activities", "Other", "Any" ]
    this.setState({ category: choices[e.target.value] });
  }
  async getCoupons(id){
    const loggedInKey = sessionStorage.getItem("UnlimitedCouponerKey")
    if (!loggedInKey) alert('You are not logged in!')
    else {
      const data = {
        id: id,
        // loggedinkeykey: loggedInKey,
      }
      const url = `api/getCoupon`
      const response = await fetch(url, {
        method: "POST", 
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      console.log(json, '!todo, alert the user that the coupon has been claimed.')
    }
  }
  async handleSearch(e){
    e.preventDefault();
    const data = {
      city: this.state.city,
      zip: this.state.zip,
      category: this.state.category,
      keyword: this.state.keywords,
      pageNumber: this.state.pageNumber
    }
    if (this.state.category !== '' || this.state.zip !== '' || this.state.city !== '' || this.state.keywords) {
      this.setState({coupons: <div className="loaderContainer"><div className="loader"></div></div>})
      const url = `/api/searchCoupons`
      const response =  await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      this.setState({coupons: this.CouponsMaker(json.coupons), incrementPageClass: "center"})
    }
}                
  render() {
    return (
      <div className="container text-center">
      <form className='searchForm'>
      <h2>Search for coupons by city, zipcode, and even by category!</h2>
      <br/>
      <SearchField
      htmlFor="City"
      name="city"
      className='searchCity'
      onChange={this.handleChange}
      />
      <br/>
      <SearchField
      htmlFor="Zip"
      name="zip"
      className='searchZip'
      onChange={this.handleChange}
      />
      <br/>
      <strong>
      <Select
          hasLabel='true'
          htmlFor='select'
          name="category"
          label='Coupon Category'
          options='Food, Entertainment, Health and Fitness, Retail, Home Improvement, Activities, Other'
          required={true}
          value={this.state.length}
          onChange={this.updateCategory} />
      </strong>
      <br/>
      <SearchField
      htmlFor="Use a keyword to specify your search"
      className='searchCategory'
      name="keywords"
      onChange={this.handleChange}
      />
      <button type="submit" value="Submit" className="searchButton" onClick={this.handleSearch}><strong>Search</strong></button>
    </form>
      {this.state.coupons}
      <div className={this.state.incrementPageClass}>
        <a className="icon-button incrementIcons backgroundCircle" onClick={this.decreasePage}>
          <i className="fa-arrow-left"></i>
        </a>
        <a className="icon-button backgroundCircle" onClick={this.incrementPage}>
          <i className="fa-arrow-right"></i>
        </a>
      </div>
    </div>
    )
  }
}

export default Search;

