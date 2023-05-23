import { classNames, templates, select } from '../settings.js';
import utils from '../utils.js';

import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    // console.log('newProduct', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */
    const generateHTML = templates.menuProduct(thisProduct.data);
    // console.log(generateHTML);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generateHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;
    thisProduct.dom = {};

    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    //console.log(thisProduct.accordionTrigger);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */

    // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    /* START: add event listener to clickable trigger on event click */

    // console.log(thisProduct.cartButton);

    thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
      /* prevent default action for event */

      event.preventDefault();

      /* find active product (product that has active class) */

      const productActive = document.querySelector(select.all.menuProductsActive);

      /* if there is active product and it's not thisProduct.element, remove class active from it */

      if (productActive && productActive !== thisProduct.element) {
        productActive.classList.remove('active');
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
    });
  }

  initOrderForm() {
    const thisProduct = this;
    // console.log('we are in initOrderForm');
    thisProduct.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.dom.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  processOrder() {
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        // check if there is param with a name of paramId in formData and if it includes optionId
        if (optionSelected) {
          // check if the option is not default
          if (option.default) {
            // add option price to price variable
            price += option.price;
          }
        } else {
          // check if the option is default
          if (!option.default) {
            // reduce price variable
            price -= option.price;
          }
        }

        const optionImage = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
        if (optionImage) {
          if (optionSelected) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    // update calculated price in the HTML
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    // console.log('price single: ', thisProduct.priceSingle);
    thisProduct.dom.priceElem.innerHTML = price;
    thisProduct.price = price;
  }
  addToCart() {
    const thisProduct = this;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
  prepareCartProduct() {
    const thisProduct = this;
    // console.log(thisProduct);
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.price,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;
  }
  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const params = {};

    // for very category (param)
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {},
      };

      // for every option in this category
      for (let optionId in param.options) {
        const option = param.options[optionId];
        // console.log(option);
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }

    return params;
  }
}

export default Product;
