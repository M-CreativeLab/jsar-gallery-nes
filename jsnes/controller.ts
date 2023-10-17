export class Controller {
  static BUTTON_A = 0;
  static BUTTON_B = 1;
  static BUTTON_SELECT = 2;
  static BUTTON_START = 3;
  static BUTTON_UP = 4;
  static BUTTON_DOWN = 5;
  static BUTTON_LEFT = 6;
  static BUTTON_RIGHT = 7;

  state = new Array(8);

  constructor() {
    this.state = new Array(8);
    for (var i = 0; i < this.state.length; i++) {
      this.state[i] = 0x40;
    }
  }

  buttonDown(key) {
    this.state[key] = 0x41;
  }

  buttonUp(key) {
    this.state[key] = 0x40;
  }
}
