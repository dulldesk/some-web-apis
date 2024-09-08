async function update(data) {
  const node = document.getElementById(data.id);
  try {
    if (!data.supported) throw new Error(`${data.label} is not supported`)
    if (data.handler) {
      const rawData = await data.handler();
      node.textContent = format(rawData)

      // listeners that rely on response data
      if (data.updateListeners) {
        data.updateListeners.forEach(info => {
          if (!info.object) {
            info.events.forEach(evt => rawData.addEventListener(evt, (e) => update(data)))
          }
        })
      }
    }
  } catch (e) {
    node.textContent = e.message ?? `${i.label} is not supported`;
  }
}
function formatFlat(d, prefix='') {
  if (d instanceof Array && d[0] instanceof Object) {
    return `${d[0].__proto__.toString()} * ${d.length}`
  } else if (d instanceof Object && !(d instanceof Array) && !(d instanceof Function)) {
    return format(d, prefix + '  ').trim()
  }
  return d
}
function format(data, prefix='') {
  const fields = Object.keys(data.__proto__)
  if (data instanceof Array) {
    return data.length ? `[\n${data.map(d => d ? format(d, prefix + '  ') : `  ${d}`).join(',\n')}\n]` : '[]'
  }
  else if (!(data instanceof Object)) {
    return `${prefix}${data}`
  }
  return `${prefix}{\n${prefix}${fields.map(i => `  ${i}: ${formatFlat(data[i], prefix)}`).join(`,\n${prefix}`)}\n${prefix}}`
}

async function triggerUpdate(id) {
  update(NODE_DATA.find(i => i.id === id))
}

async function generateNodes() {
  const template = document.querySelector('template#node')
  const main = document.querySelector('main')

  NODE_DATA.forEach((data) => {
    const nd = template.content.cloneNode(true);
    nd.querySelector('a').textContent = data.label;
    nd.querySelector('a').href = data.url;
    nd.querySelector('div').id = data.id;

    if (data.supported) {
      if (data.footer?.buttons) {
        data.footer.buttons.forEach(cfg => {
          const btn = document.createElement('button')
          btn.textContent = cfg.label
          btn.addEventListener('click', cfg.onclick)
          nd.querySelector('footer').appendChild(btn)
        })
      }
      if (data.footer?.caption) {
        const span = document.createElement('small')
        span.className = 'faded'
        span.textContent = data.footer.caption
        nd.querySelector('footer').appendChild(span)
      }

      // add listeners to given data object
      if (data.updateListeners) {
        data.updateListeners.forEach(info => {
          if (info.object) {
            info.events.forEach(evt => info.object.addEventListener(evt, (e) => update(data)))
          }
        })
      }
    }
    main.appendChild(nd)
    update(data)
  })
}
generateNodes()

