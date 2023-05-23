import { classNames, settings, templates, select } from '../settings.js';
import utils from '../utils.js';

import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }
  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct) {
    const thisCart = this;
    /* generate HTML based on template */
    const generateHTML = templates.cartProduct(menuProduct);
    // console.log(generateHTML);
    /* create element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generateHTML);
    /* add element to menu */
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  update() {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;

    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }

    if (thisCart.totalNumber !== 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    } else {
      thisCart.deliveryFee = 0;
      thisCart.totalPrice = 0;
    }
    // console.log(thisCart.totalPrice);
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

    for (let totalPriceHolder of thisCart.dom.totalPrice) {
      totalPriceHolder.innerHTML = thisCart.totalPrice;
    }
  }
  remove(cartProduct) {
    const thisCart = this;

    // console.log(thisCart);

    const indexOfProduct = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(indexOfProduct, 1);

    // console.log(indexOfProduct);

    cartProduct.dom.wrapper.remove();
    thisCart.update();

    console.log('test', thisCart.products);
  }
  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    // console.log('payload', payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }
}

export default Cart;
