const CONFIG = {
  min: 0,
  max: 10000,
  step: 100,
  minGap: 500
}

function clamp(value, min = CONFIG.min, max = CONFIG.max) {
  return Math.min(Math.max(value, min), max);
}

function roundtToStep(value, step = CONFIG.step, min = CONFIG.min) {
  return Math.round((value - min) / step) * step + min;
}

function valueToPercent(value, min = CONFIG.min, max = CONFIG.max) {
  return ((value - min) / (max - min)) * 100;
}

function percentToValue(percent, min = CONFIG.min, max = CONFIG.max) {
  return min + (percent / 100) * (max - min);
}


function createState(config) {
  return { from: config.min, to: config.max };
}

function updateState(state, thumb, rawValue, config) {
  const value = roundtToStep(rawValue, config.step, config.min);
  if (thumb === 'from') {
    const from = clamp(value, config.min, state.to - config.minGap);
    return { ...state, from };
  }
  const to = clamp(value, state.from + config.minGap, config.max);
  return { ...state, to };
}


function getElements(root) {
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

function render(elements, state, config) {
  const fromPrecent = valueToPercent(state.from, config.min, config.max);
  const toPrecent = valueToPercent(state.to, config.min, config.max);

  elements.thumbs.from.style.left = fromPrecent + '%';
  elements.thumbs.to.style.left = toPrecent + '%';

  elements.fill.style.left = fromPrecent + '%';
  elements.fill.style.width = toPrecent - fromPrecent + '%';

  elements.inputs.from.value = state.from;
  elements.inputs.to.value = state.to;

  elements.thumbs.from.setAttribute("aria-valuenow", state.from);
  elements.thumbs.to.setAttribute("aria-valuenow", state.to);
}


function getValueFromPointer(event, track, config) {
  const rect = track.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percent = clamp((x / rect.width) * 100, 0, 100);
  return percentToValue(percent, config.min, config.max);
}

function getClosestThumb(state, value) {
  const distanceToFrom = Math.abs(value - state.from);
  const distanceToTo = Math.abs(value - state.to);
  return distanceToFrom <= distanceToTo ? 'from' : 'to';
}


function initRangeSlider(root, config, onChange) {
  const elements = getElements(root);
  let state = createState(config);

  function commit(newState) {
    state = newState;
    render(elements, state, config);
    if (onChange) onChange(state);
  }

  function setValue(thumb, rawValue) {
    commit(updateState(state, thumb, rawValue, config));
  }

  ['from', 'to'].forEach((thumb) => {
    elements.thumbs[thumb].setAttribute('aria-valuemin', config.min);
    elements.thumbs[thumb].setAttribute('aria-valuemax', config.man);
  });

  ['from', 'to'].forEach((thumb) => {
    const thumbElem = elements.thumbs[thumb];

    thumbElem.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      thumbElem.setPointerCapture(e.pointerId);
      thumbElem.classList.add('isActive');
      thumbElem.focus();
    });

    thumbElem.addEventListener('pointermove', (e) => {
      if (!thumbElem.hasPointerCapture(e.pointerId)) return;

      setValue(thumb, getValueFromPointer(e, elements.track, config));
    });

    thumbElem.addEventListener('pointerup', (e) => {
      thumbElem.releasePointerCapture(e.pointerId);
      thumbElem.classList.remove('isActive');
    });

    thumbElem.addEventListener('keydown', (e) => {
      let delta = 0;
      if (e.key == 'ArrowRight' || e.key =='ArrowUp') delta = config.step;
      if (e.key == 'ArrowLeft' || e.key =='ArrowDown') delta = -config.step;
      if (delta == 0) return;
      
      e.preventDefault();
      setValue(thumb, state[thumb] + delta);
    });
  });

  elements.track.addEventListener('pointerdown', (e) => {
    if (e.target !== elements.track && e.target !== elements.fill) return;

    const value = getValueFromPointer(e, elements.track, config);
    setValue(getClosestThumb(state, value), value);
  });

  ['from', 'to'].forEach((thumb) => {
    const input = elements.inputs[thumb];
    input.min = config.min;
    input.max = config.max;
    input.step = config.step;

    input.addEventListener('change', () => {
      const number = Number(input.value);
      if (input.value == '' || Number.isNaN(number)) {
        render(elements, state, config);
        return;
      }
      setValue(thumb, number);
    });
  });

  commit(state);
  return {
    getValues: function () {
      return { ...state };
    },
    setValues: function (from, to) {
      let next = createState(config);
      next = updateState(next, 'to', to, config);
      next = updateState(next, 'from', from, config);
      commit(next);
    }
  }
}


const output = document.querySelector('#result');

const priceSlider = initRangeSlider(
  document.querySelector('#priceSlider'),
  CONFIG,
  function (values) {
    output.textContent = values.from + ' - ' + values.to + ' грн. '
  }
);