'use strict';

class App
{
  constructor(elm_input)
  {
    // init DOM objects
    this.cvs_graphics = document.createElement('canvas');
    this.txt_input = document.querySelector(elm_input);
    this.txt_input.addEventListener('keyup', () => {
      
	  this.parser = new Parser();
	  let model = this.parser.parse(this.txt_input.value);
      //this.drawer.draw(this.cvs_graphics, model);

    });

  }
  get inputbox() {
    return this.txt_input;
  }
  get canvas() {
    return this.cvs_graphics;
  }

}

let app = new App('#txt-syntax');
