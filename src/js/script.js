/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-price .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal',
      deliveryFee: '.cart__order-delivery',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu(){
      const thisProduct = this;

      /*generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /*create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /*find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);

      /*add element to menu*/
      menuContainer.appendChild(thisProduct.element);

    }
    
    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector (select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem =thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
      
      /* find the clickable trigger (the element that should react to clicking) */
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */
      //clickableTrigger.addEventListener('click', function(event) {
      
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        
        /* prevent default action for event */
        event.preventDefault();
      
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
      
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct !== null && activeProduct !== thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
      
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
   
      });
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });     

    }

    processOrder(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
        
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          // check if there is param with a name of paramId in formData and if it includes optionId
          if(optionSelected) {
            // check if the option is not default
            if(option.default != true) {
              // add option price to price variable
              price += option.price;
            }
          // check if the option is default
          } else if (option.default == true) {
          // reduce price variable
            price -= option.price;
          }
        
          const optionImage = thisProduct.imageWrapper.querySelector ('.' + paramId + '-' + optionId);
          
          if(optionImage) {
            if(optionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      // priceSingle
      thisProduct.priceSingle = price;

      // multiply price by amount
      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
    
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    
    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct (){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.amountWidget.value * thisProduct.priceSingle,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      const params = {};
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        };
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
        
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected) {
            // option is selected!
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }
  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions (thisWidget.value);
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      
    }
    
    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);
      const minValue = settings.amountWidget.defaultMin;
      const maxValue = settings.amountWidget.defaultMax;

      
      /* TODO: Add validation */
      if(thisWidget.value !== newValue && !isNaN(newValue)) {
        thisWidget.value = newValue;
      }
      if(thisWidget.value < minValue) {
        thisWidget.value = minValue;
      }
      if(thisWidget.value > maxValue) {
        thisWidget.value = maxValue + 1;
      }
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    
    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true 
      });
      thisWidget.element.dispatchEvent(event);
    }
  }
 
  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element,
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector (select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector (select.cart.address);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      
      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    add(menuProduct){
      // const thisCart = this;
      const thisCart = this;

      /*generate HTML based on template*/
      const generatedHTML = templates.cartProduct(menuProduct);

      /*create element using utils.createElementFromHTML*/
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      /*add element to menu*/
      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();

    }

    update(){
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
      
      for (let product of thisCart.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }

      if (totalNumber != 0){
        thisCart.totalPrice = subtotalPrice + deliveryFee;
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      } else {
        thisCart.totalPrice = 0;
        thisCart.dom.deliveryFee.innerHTML = 0;
      }
      
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;

      console.log (thisCart.dom.totalPrice);
      for (let price of thisCart.dom.totalPrice){
        price.innerHTML = thisCart.totalPrice;
      }
    }

    remove(event){
      const thisCart = this;

      event.dom.wrapper.remove();

      const productsRemove = thisCart.products.indexOf(event);
      thisCart.products.splice(productsRemove, 1);

      thisCart.update();
    }

    sendOrder(){
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.dom.deliveryFee,
        products: [],
      };

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options);
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name,
      thisCartProduct.amount = menuProduct.amount,
      thisCartProduct.priceSingle = menuProduct.priceSingle,
      thisCartProduct.price = menuProduct.price,
      thisCartProduct.params = menuProduct.params,

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }
    
    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidgetElem = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }
    
    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
      thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
    
    getData (){
      const thisCartProduct = this;

      const data = {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        amount: thisCartProduct.amount,
        priceSingle: thisCartProduct.priceSingle,
        price: thisCartProduct.price,
        params: thisCartProduct.params,
      };
      return data;
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
   
    initData: function(){
      const thisApp = this;
  
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;
          /* execute initMenu method */
          thisApp.initMenu();
        });

      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
           
      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
}