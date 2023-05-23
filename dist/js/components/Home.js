import { templates } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
  }

  render(element) {
    const thisHome = this;

    const generateHTML = templates.homePage(element);

    thisHome.dom = {};
    thisHome.dom.wrapper = element;

    thisHome.dom.wrapper.innerHTML = generateHTML;
  }
}

export default Home;
