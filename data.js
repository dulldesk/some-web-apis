var midiAccess;
const NODE_DATA = [
  {
    label: 'navigator.getBattery()',
    id: 'battery',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getBattery',
    supported: !!navigator.getBattery,
    handler: async() => await navigator.getBattery(),
    updateListeners: [{events: ['chargingchange', 'chargingtimechange', 'dischargingtimechange', 'levelchange']}]
  },
  {
    label: 'screen.orientation',
    id: 'orient',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation',
    supported: !!screen.orientation,
    handler: async() => screen.orientation,
    updateListeners: [{events: ['change'], object: screen.orientation}]
  },
  {
    label: 'navigator.connection',
    id: 'connect',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API',
    supported: !!navigator.connection,
    handler: async() => navigator.connection,
    updateListeners: [{events: ['change'], object: navigator.connection}]
  },
  {
    label: 'navigator midi',
    id: 'midi',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/requestMIDIAccess',
    expandArrayFields: true,
    supported: !!navigator.requestMIDIAccess,
    handler: async() => {
      if (midiAccess) return midiAccess
      throw new Error('no midi detected')
    },
    footer: {
      buttons: [
        {
          label: 'request midi access',
          onclick: async() => {
            midiAccess = await navigator.requestMIDIAccess({software: true})
            triggerUpdate('midi');
          },
        }
      ],
    },
    updateListeners: [{events: ['onstatechange']}]
  },
  {
    label: 'navigator.getGamepads()',
    id: 'gamepads-get',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getGamepads',
    supported: !!(navigator.getGamepads || navigator.webkitGetGamepads),
    handler: async() => navigator.getGamepads() || navigator.webkitGetGamepads(),
    updateListeners: [{events: ['gamepadconnected', 'gamepaddisconnected'], object: window}],
    footer: {
      buttons: [
        {
          label: 'vibrate',
          onclick: async() => {
            (await navigator.getGamepads()).forEach(g => g?.vibrationActuator?.playEffect(g.vibrationActuator.effects[0], {
              startDelay: 0, duration: 200, weakMagnitude: 1.0, strongMagnitude: 1.0 }
            ))
          },
        },
      ],
      caption: 'if one is connected, press a button on it',
    }
  },
  {
    label: 'navigator.usb.getDevices()',
    id: 'usb-get',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/USB/getDevices',
    supported: !!navigator.usb,
    handler: async() => navigator.usb.getDevices(),
    footer: {
      buttons: [
        {
          label: 'request usb devices',
          onclick: async() => {
            await navigator.usb.requestDevice({ filters: [] })
            triggerUpdate('usb-get');
          },
        }, {
          label: 'forget all',
          onclick: async() => {
            (await navigator.usb.getDevices()).forEach(d => d.forget())
            triggerUpdate('usb-get');
          },
        }
      ],
    },
    updateListeners: [{events: ['connect', 'disconnect'], object: navigator.usb}]
  },
]
