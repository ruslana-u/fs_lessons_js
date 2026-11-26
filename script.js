// CLASS APPROACH START

class RangeSlider{
  static defaults = {
    min: 0,
    max: 100,
    step: 1,
    minGap: 0
  }

  static clamp(
    value,
    min = RangeSlider.defaults.min,
    max = RangeSlider.defaults.max
  ) {
    return Math.min(Math.max(value, min), max);
  }

  static roundtToStep(
    value,
    step = RangeSlider.defaults.step,
    min = RangeSlider.defaults.min
  ) {
    return Math.round((value - min) / step) * step + min;
  }

  static valueToPercent(
    value,
    min = RangeSlider.defaults.min,
    max = RangeSlider.defaults.max
  ) {
    return ((value - min) / (max - min)) * 100;
  }

  static percentToValue(
    percent,
    min = RangeSlider.defaults.min,
    max = RangeSlider.defaults.max
  ) {
    return min + (percent / 100) * (max - min);
  }

  #config;
  #elements;
  #state;
  #onChange;

  constructor(root, options = {}) {
    if (!root) {
      throw new Error('RangeSlider: root not found');
    }

    const { onChange, ...config } = options;

    this.#config = { ...RangeSlider.defaults, ...config };
    this.#onChange = onChange;
    this.#state = {
      from: this.#config.min,
      to: this.#config.max
    };
    this.#elements = this.#findElements(root);

    this.#setupAttributes();
    this.#bindEvents();
    this.#update();
  }

  get values() {
    return { ... this.#state };
  }

  setValues(from, to) {
    this.#state = {
      from: this.#config.min,
      to: this.#config.max
    };
    this.#applyValue('to', to);
    this.#applyValue('from', from);
    this.#update();
  }

  destroy() {
    this.#unbindEvents();
  }

  #findElements(root) {
    return {
      track: root.querySelector('.rangeSlider__track'),
      fill: root.querySelector('.rangeSlider__fill'),
      thumbs: {
        from: root.querySelector('[data-thumb="from"]'),
        to: root.querySelector('[data-thumb="to"]'),
      },
      inputs: {
        from: root.querySelector('[data-input="from"]'),
        to: root.querySelector('[data-input="to"]'),
      }
    }
  }

  #setupAttributes() {
    const { min, max, step } = this.#config;
    const { thumbs, inputs } = this.#elements;
    for (const thumb of ['from', 'to']){
      thumbs[thumb].setAttribute('aria-valuemin', min);
      thumbs[thumb].setAttribute('aria-valuemax', max);
      inputs[thumb].min = min;
      inputs[thumb].max = max;
      inputs[thumb].step = step;

    }
  }

  #applyValue(thumb, rawValue) {
    const { min, max, step, minGap } = this.#config;
    const value = RangeSlider.roundtToStep(rawValue, step, min);

    if (thumb == 'from') {
      this.#state.from = RangeSlider.clamp(value, min, this.#state.to - minGap);
    } else {
      this.#state.to = RangeSlider.clamp(value, this.#state.from + minGap, max);
    }
  }

  #setValue(thumb, rawValue) {
    this.#applyValue(thumb, rawValue);
    this.#update();
  }

  #update() {
    this.#render();
    if (this.#onChange) this.#onChange(this.values);
  }

  #render() {
    const { min, max } = this.#config;
    const {from, to } = this.#state;
    const { thumbs, fill, inputs } = this.#elements;

    const fromPercent = RangeSlider.valueToPercent(from, min, max);
    const toPercent = RangeSlider.valueToPercent(to, min, max);

    thumbs.from.style.left = fromPercent + '%';
    thumbs.to.style.left = toPercent + '%';

    thumbs.from.style.zIndex = fromPercent > 50 ? '3' : '';

    fill.style.left = fromPercent + '%';
    fill.style.width = toPercent - fromPercent + '%';

    inputs.from.value = from;
    inputs.to.value = to;

    thumbs.from.setAttribute("aria-valuenow", from);
    thumbs.to.setAttribute("aria-valuenow", to);
  }

  #getValueFromPointer(event) {
    const { min, max } = this.#config;
    const rect = this.#elements.track.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = RangeSlider.clamp((x / rect.width) * 100, 0, 100);
    
    return RangeSlider.percentToValue(percent, min, max);
  }

  #getClosestThumb(value) {
    const distanceToFrom = Math.abs(value - this.#state.from);
    const distanceToTo = Math.abs(value - this.#state.to);
    
    return distanceToFrom <= distanceToTo ? 'from' : 'to';
  }


  #handleThumbPointerDown = (e) => {
    const thumbElem = e.currentTarget;
    e.preventDefault();
    thumbElem.setPointerCapture(e.pointerId);
    thumbElem.classList.add('isActive');
    thumbElem.focus();
  }

  #handleThumbPointerMove = (e) => {
    const thumbElem = e.currentTarget;

    if (!thumbElem.hasPointerCapture(e.pointerId)) return;

    this.#setValue(thumbElem.dataset.thumb,
      this.#getValueFromPointer(e)
    );
  }

  #handleThumbPointerUp = (e) => {
    const thumbElem = e.currentTarget;
    thumbElem.releasePointerCapture(e.pointerId);
    thumbElem.classList.remove('isActive');
  }

  #handleThumbKeyDown = (e) => {
    const thumb = e.currentTarget.dataset.thumb;
    const { step } = this.#config;

    let delta = 0;
    if (e.key == 'ArrowRight' || e.key =='ArrowUp') delta = step;
    if (e.key == 'ArrowLeft' || e.key =='ArrowDown') delta = -step;
    if (delta == 0) return;
      
    e.preventDefault();
    this.#setValue(thumb, this.#state[thumb] + delta);
  }

  #handleTrackPointerDown = (e) => {
    const { track, fill } = this.#elements;
    if (e.target !== track && e.target !== fill) return;

    const value = this.#getValueFromPointer(e);
    this.#setValue(this.#getClosestThumb(value), value);
  }

  #handleInputChange = (e) => {
    const input = e.currentTarget;
    const number = Number(input.value);
    if (input.value == '' || Number.isNaN(number)) {
      this.#render();
      return;
    }
    this.#setValue(input.dataset.input, number);
  }

  #bindEvents() {
    const { track, thumbs, inputs } = this.#elements;

    for (const thumbElem of [thumbs.from, thumbs.to]) {
      thumbElem.addEventListener('pointerdown', this.#handleThumbPointerDown);
      thumbElem.addEventListener('pointermove', this.#handleThumbPointerMove);
      thumbElem.addEventListener('pointerup', this.#handleThumbPointerUp);
      thumbElem.addEventListener('keydown', this.#handleThumbKeyDown);
    }

    track.addEventListener('pointerdown', this.#handleTrackPointerDown);

    for (const input of [inputs.from, inputs.to]) {
      input.addEventListener('change', this.#handleInputChange);
    }
  }

  #unbindEvents() {
    const { track, thumbs, inputs } = this.#elements;

    for (const thumbElem of [thumbs.from, thumbs.to]) {
      thumbElem.removeEventListener('pointerdown', this.#handleThumbPointerDown);
      thumbElem.removeEventListener('pointermove', this.#handleThumbPointerMove);
      thumbElem.removeEventListener('pointerup', this.#handleThumbPointerUp);
      thumbElem.removeEventListener('keydown', this.#handleThumbKeyDown);
    }

    track.removeEventListener('pointerdown', this.#handleTrackPointerDown);

    for (const input of [inputs.from, inputs.to]) {
      input.removeEventListener('change', this.#handleInputChange);
    }
  }
}

const priceOutput = document.querySelector('#priceResult');
const yearOutput = document.querySelector('#yearResult');

const priceSlider = new RangeSlider(document.querySelector('#priceSlider'), {
  min: 0,
  max: 10000,
  step: 100,
  minGap: 500,
  onChange: (values) => {
    priceOutput.textContent = values.from + ' - ' + values.to + ' грн'
  },
});

const yearSlider = new RangeSlider(document.querySelector('#yearSlider'), {
  min: 1990,
  max: 2026,
  onChange: (values) => {
    yearOutput.textContent =
      values.from == values.to
      ? values.from + ' рік'
      : values.from + ' - ' + values.to + ' роки'
  },
});

// CLASS APPROACH END



// FUNCTIONAL APPROACH START

// const CONFIG = {
//   min: 0,
//   max: 10000,
//   step: 100,
//   minGap: 500
// }

// function clamp(value, min = CONFIG.min, max = CONFIG.max) {
//   return Math.min(Math.max(value, min), max);
// }

// function roundtToStep(value, step = CONFIG.step, min = CONFIG.min) {
//   return Math.round((value - min) / step) * step + min;
// }

// function valueToPercent(value, min = CONFIG.min, max = CONFIG.max) {
//   return ((value - min) / (max - min)) * 100;
// }

// function percentToValue(percent, min = CONFIG.min, max = CONFIG.max) {
//   return min + (percent / 100) * (max - min);
// }


// function createState(config) {
//   return { from: config.min, to: config.max };
// }

// function updateState(state, thumb, rawValue, config) {
//   const value = roundtToStep(rawValue, config.step, config.min);
//   if (thumb === 'from') {
//     const from = clamp(value, config.min, state.to - config.minGap);
//     return { ...state, from };
//   }
//   const to = clamp(value, state.from + config.minGap, config.max);
//   return { ...state, to };
// }


// function getElements(root) {
//   return {
//     track: root.querySelector('.rangeSlider__track'),
//     fill: root.querySelector('.rangeSlider__fill'),
//     thumbs: {
//       from: root.querySelector('[data-thumb="from"]'),
//       to: root.querySelector('[data-thumb="to"]'),
//     },
//     inputs: {
//       from: root.querySelector('[data-input="from"]'),
//       to: root.querySelector('[data-input="to"]'),
//     }
//   }
// }

// function render(elements, state, config) {
//   const fromPrecent = valueToPercent(state.from, config.min, config.max);
//   const toPrecent = valueToPercent(state.to, config.min, config.max);

//   elements.thumbs.from.style.left = fromPrecent + '%';
//   elements.thumbs.to.style.left = toPrecent + '%';

//   elements.fill.style.left = fromPrecent + '%';
//   elements.fill.style.width = toPrecent - fromPrecent + '%';

//   elements.inputs.from.value = state.from;
//   elements.inputs.to.value = state.to;

//   elements.thumbs.from.setAttribute("aria-valuenow", state.from);
//   elements.thumbs.to.setAttribute("aria-valuenow", state.to);
// }


// function getValueFromPointer(event, track, config) {
//   const rect = track.getBoundingClientRect();
//   const x = event.clientX - rect.left;
//   const percent = clamp((x / rect.width) * 100, 0, 100);
//   return percentToValue(percent, config.min, config.max);
// }

// function getClosestThumb(state, value) {
//   const distanceToFrom = Math.abs(value - state.from);
//   const distanceToTo = Math.abs(value - state.to);
//   return distanceToFrom <= distanceToTo ? 'from' : 'to';
// }


// function initRangeSlider(root, config, onChange) {
//   const elements = getElements(root);
//   let state = createState(config);

//   function commit(newState) {
//     state = newState;
//     render(elements, state, config);
//     if (onChange) onChange(state);
//   }

//   function setValue(thumb, rawValue) {
//     commit(updateState(state, thumb, rawValue, config));
//   }

//   ['from', 'to'].forEach((thumb) => {
//     elements.thumbs[thumb].setAttribute('aria-valuemin', config.min);
//     elements.thumbs[thumb].setAttribute('aria-valuemax', config.max);
//   });

//   ['from', 'to'].forEach((thumb) => {
//     const thumbElem = elements.thumbs[thumb];

//     thumbElem.addEventListener('pointerdown', (e) => {
//       e.preventDefault();
//       thumbElem.setPointerCapture(e.pointerId);
//       thumbElem.classList.add('isActive');
//       thumbElem.focus();
//     });

//     thumbElem.addEventListener('pointermove', (e) => {
//       if (!thumbElem.hasPointerCapture(e.pointerId)) return;

//       setValue(thumb, getValueFromPointer(e, elements.track, config));
//     });

//     thumbElem.addEventListener('pointerup', (e) => {
//       thumbElem.releasePointerCapture(e.pointerId);
//       thumbElem.classList.remove('isActive');
//     });

//     thumbElem.addEventListener('keydown', (e) => {
//       let delta = 0;
//       if (e.key == 'ArrowRight' || e.key =='ArrowUp') delta = config.step;
//       if (e.key == 'ArrowLeft' || e.key =='ArrowDown') delta = -config.step;
//       if (delta == 0) return;
      
//       e.preventDefault();
//       setValue(thumb, state[thumb] + delta);
//     });
//   });

//   elements.track.addEventListener('pointerdown', (e) => {
//     if (e.target !== elements.track && e.target !== elements.fill) return;

//     const value = getValueFromPointer(e, elements.track, config);
//     setValue(getClosestThumb(state, value), value);
//   });

//   ['from', 'to'].forEach((thumb) => {
//     const input = elements.inputs[thumb];
//     input.min = config.min;
//     input.max = config.max;
//     input.step = config.step;

//     input.addEventListener('change', () => {
//       const number = Number(input.value);
//       if (input.value == '' || Number.isNaN(number)) {
//         render(elements, state, config);
//         return;
//       }
//       setValue(thumb, number);
//     });
//   });

//   commit(state);
//   return {
//     getValues: function () {
//       return { ...state };
//     },
//     setValues: function (from, to) {
//       let next = createState(config);
//       next = updateState(next, 'to', to, config);
//       next = updateState(next, 'from', from, config);
//       commit(next);
//     }
//   }
// }


// const output = document.querySelector('#result');

// const priceSlider = initRangeSlider(
//   document.querySelector('#priceSlider'),
//   CONFIG,
//   function (values) {
//     output.textContent = values.from + ' - ' + values.to + ' грн. '
//   }
// );

// FUNCTIONAL APPROACH END