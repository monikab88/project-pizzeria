import {select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking{
  constructor(element){
    const thisBooking = this;
  
    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  
  render(element){
    const thisBooking = this;
  
    const generatedHTML = templates.bookingWidget();
  
    thisBooking.dom = {
      wrapper: element,
      peopleAmount: element.querySelector(select.booking.peopleAmount),
      hoursAmount: element.querySelector(select.booking.hoursAmount)
    };
  
    thisBooking.dom.wrapper = utils.createDOMFromHTML(generatedHTML);
  
    const bookingContainer = document.querySelector(select.containerOf.booking);
  
    bookingContainer.appendChild(thisBooking.dom.wrapper);
  }
  
  initWidgets(){
    const thisBooking = this;
  
    thisBooking.peopleAmounElem = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountElem = new AmountWidget(thisBooking.dom.hoursAmount);
  
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
  
    }); 
  
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
  
    });
  }
}

export default Booking;