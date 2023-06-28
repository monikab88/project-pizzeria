import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;
  
    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  
  render(element){
    const thisBooking = this;
  
    const generatedHTML = templates.bookingWidget();
  
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerInput = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerInput = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }
  
  initWidgets(){
    const thisBooking = this;
  
    thisBooking.peopleAmounElem = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
  
    }); 
    thisBooking.hoursAmountElem = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
  
    });
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePickerInput);
    thisBooking.hourPickerPicker = new HourPicker(thisBooking.dom.hourPickerInput);
  }
};

export default Booking;