class StrategyHomekitDashboard {
  static async generate(config, hass) {
    // Query all data we need. We will make it available to views by storing it in strategy options.
    const [all_areas, all_entities] = await Promise.all([
      hass.callWS({ type: "config/area_registry/list" }),
      hass.callWS({ type: "config/entity_registry/list" }),
    ]);

    // console.log('CONFIG', config)
    // console.log('HASS', hass)
    // console.log('ALL_AREAS', all_areas)
    // console.log('ALL_ENTITIES', all_entities)

    const options = config['config'] || {}

    const home_name = options['home_name'] || 'My Home'
    const hide_areas = options['hide_areas']
    const show_areas = options['show_areas']
    const hide_entities = options['hide_entities']
    const show_entities = options['show_entities']

    // Default area order
    all_areas.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()))

    const all_area_ixs = Array.from({ length: all_areas.length }, (value, index) => index)
    const area_id_map = Object.fromEntries(all_area_ixs.map(x => [all_areas[x].area_id, x]))

    let show_area_ixs = []
    if (show_areas) {
      show_area_ixs = show_areas.map(s => area_id_map[s])
      if (hide_areas != true) {
        show_area_ixs = show_area_ixs.concat(all_area_ixs.filter(x => !show_area_ixs.includes(x)))
      }
    } else {
      show_area_ixs = Array.from({ length: all_areas.length }, (value, index) => index);
    }
    if (hide_areas && Array.isArray(hide_areas))
      show_area_ixs = show_area_ixs.filter(x => !hide_areas.includes(all_areas[x].area_id))

    const areas = show_area_ixs.map(x => all_areas[x])

    const sec_dev_classes = [ 'door', 'garage', 'garage_door', 'gate',
                                      'lock', 'tamper', 'window' ]

    // completely arbitrary, works for me
    const domain_order = options['domain_order'] || [
      'motion',
      'light',
      'temperature',
      'humidity',
      'fan',
      'climate',
      'lock',
      'security',
      'alarm_control_panel',
      'media_player',
      'irrigation',
      'water',
    ]

    function order_entities(a, b) {
      const da = a._domain
      const db = b._domain
      const ia = domain_order.indexOf(da)
      const ib = domain_order.indexOf(db)
      const na = get_attr(a, 'friendly_name').toUpperCase()
      const nb = get_attr(b, 'friendly_name').toUpperCase()

      // if a not found
      if (ia < 0) {
        // and b not found
        if (ib < 0)
          // compare names
          return na.localeCompare(nb)
        // else a after b
        return 1
      }

      // if same domain compare names
      if (ia == ib) {
        if (da == 'light') {
          // light groups sort before lights
          const ga = get_attr(a, 'entity_id') != null
          const gb = get_attr(b, 'entity_id') != null
          if (ga != gb) {
            if (ga)
              return -1
            else
              return 1
          }
        }
        return na.localeCompare(nb)
      }

      // sort, or b last if not found
      if (ia < ib || ib < 0)
        return -1
      else
        return 1
    }

    function entity_domain(entity) {
      // console.info('ENTITY DOMAIN', entity.entity_id)
      const domain = entity.entity_id.split('.')[0]

      if (domain == 'cover') {
        if (sec_dev_classes.includes(get_attr(entity, 'device_class')))
          return 'security'
        else
          return 'climate'
      }
      if (domain == 'switch' && get_attr(entity, 'sprinkler_head_type'))
        return 'irrigation'
      return domain
    }

    // Only keep entities that have an area, or whose device has an area,
    // where the area is going to be shown, and whose domain we want.
    // Ignore hidden and disabled entities and those with no friendly_name.
    const area_entities = [];
    for (const entity of all_entities) {
      if (entity.hidden_by == null && entity.disabled_by == null) {
        if (entity.area_id == null && entity.device_id != null)
            entity.area_id = hass['devices'][entity.device_id]['area_id']
        entity._domain = entity_domain(entity)
        if (entity.area_id != null &&
            get_attr(entity, 'friendly_name') != null &&
            show_area_ixs.includes(area_id_map[entity.area_id]))
          area_entities.push(entity)
      }
    }

    // Default entity order
    area_entities.sort(order_entities)

    const area_entity_ixs = Array.from({ length: area_entities.length }, (value, index) => index)
    const entity_id_map = Object.fromEntries(area_entity_ixs.map(x => [area_entities[x].entity_id, x]))

    let show_entity_ixs = []
    if (show_entities) {
      show_entity_ixs = show_entities.map(s => entity_id_map[s])
      if (hide_entities != true) {
        show_entity_ixs = show_entity_ixs.concat(area_entity_ixs.filter(x => !show_entity_ixs.includes(x)))
      }
    } else {
      show_entity_ixs = Array.from({ length: area_entities.length }, (value, index) => index);
    }
    if (hide_entities && Array.isArray(hide_entities))
      show_entity_ixs = show_entity_ixs.filter(x => !hide_entities.includes(area_entities[x].entity_id))

    const entities = show_entity_ixs.map(x => area_entities[x])

    const kiosk_mode = {
      hide_dialog_light_color_actions: true,
      non_admin_settings: {
        hide_overflow: true,
        hide_sidebar: true
      },
      mobile_settings: {
        hide_overflow: true,
        hide_sidebar: true
      },
    }

    // if "input_boolean.hkdb_show_sidebar" exists it overrides
    // setting "hide_sidebar" to false in other conditionals
    if (hass.entities['input_boolean.hkdb_show_sidebar']) {
      kiosk_mode.entity_settings = [{
        entity: {
          "input_boolean.hkdb_show_sidebar": "on",
        },
        hide_sidebar: false,
      }]
    }

    const views = options['views'] || [
      { area_id: 'home',  name: home_name, icon: 'mdi:home' },
      { area_id: 'climate',  name: 'Climate',
          icon: 'mdi:fan', domains: [ 'climate', 'fan' ] },
      { area_id: 'light',  name: 'Lights',
          icon: 'mdi:lightbulb', domains: [ 'light' ] },
      { area_id: 'security',  name: 'Security',
          icon: 'mdi:security', domains: [ 'alarm_control_panel', 'lock', 'security' ] },
      { area_id: 'media',  name: 'Media',
          icon: 'mdi:music', domains: [ 'media_player' ] },
      { area_id: 'water',  name: 'Water',
          icon: 'mdi:water', domains: [ 'irrigation' ] },
    ]

    const lists = [
      { area_id: 'humidity',  name: 'Humidity', icon: 'mdi:water-percent' },
      { area_id: 'temperature',  name: 'Temperature', icon: 'mdi:thermometer' },
    ]

    // Generate per-area temperature and humidity pages
    areas.map(a => {
      lists.push({ area_id: `${a.area_id}_temperature`,
                    name: 'Temperature', icon: 'mdi:thermometer' })
      lists.push({ area_id: `${a.area_id}_humidity`,
                    name: 'Humidity', icon: 'mdi:water-percent' })
    })

    function get_attr(entity, attr) {
      // console.info('GET ATTR (DASHBOARD)', entity.entity_id, attr)
      const state = hass.states[entity.entity_id]
      if (state)
        return state['attributes'][attr]
      return null
    }

    // checking urls really slows down app startup so cache them
    const checked_urls = {}

    function url_exists(url, method='HEAD') {
      // console.info('URL EXISTS', method, url)
      if (url in checked_urls) {
        return checked_urls[url]
      }

      var req = new XMLHttpRequest();
      req.open(method, url, false);
      req.send();

      if (req.status == 200) {
        checked_urls[url] = true
        return true
      }

      if (req.status == 405)
        // HEAD not allowed for some URLs (e.g. /api/image...)
        return url_exists(url, 'GET')

      checked_urls[url] = false
      return false
    }

    function gen_background(view) {
      // console.info('GEN BACKGROUND', view)
      // Leave list backgrounds empty/white, like the Apple app.  Kinda ugly.
      if (lists.indexOf(view) >= 0)
        return {}

      let view_background = options.background_images && options.background_images[view.area_id]
      let bg_image = (
        view_background ||
        view.picture ||
        options.background_image ||
        options.background_img ||
        '/local/community/homekit-dashboard/view_background.jpg' ||
        '/local/view_background.jpg'
      )
      if (!url_exists(bg_image))
        bg_image = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Wikidata_logo_under_construction_sign_wallpaper.png'
      return {
        image: bg_image,
        alignment: 'center',
        attachment: 'fixed',
        opacity: 100,
        repeat: 'repeat',
        size: 'cover',
      }
    }

    // Each view is based on a strategy so we delay rendering until it's opened
    return {
      kiosk_mode: options['kiosk_mode'] || kiosk_mode,
      views: views.concat(areas).concat(lists).map((view) => ({
        strategy: {
          type: "custom:homekit-dashboard",
          view,
          views,
          areas,
          lists,
          entities,
          sec_dev_classes,
          options,
        },
        type: 'sections',
        title: view.name,
        icon: view.icon,
        path: view.area_id,
        max_columns: 4,
        subview: (areas.concat(lists).indexOf(view) >= 0),
        background: gen_background(view),
      }))
    }
  }
}

class StrategyHomekitDashboardView {
  static async generate(config, hass) {
    const { view, views, areas, lists, entities, sec_dev_classes, options } = config;

    // if ( view != null) { console.log('VIEW', view) };
    // console.log('AREAS', view, areas)
    // console.log('ENTITIES', view.area_id, entities)
    // console.log('OPTIONS', options)

    const dashboard_name = hass['panelUrl']

    // These are "active" when they're closed while HA sees all covers as active when
    // open.  For awnings, doors, windows, etc. that makes sense but not for e.g. shades
    // so we reverse the visual cues.
    const rev_open_close = [ "shade" ]

    // seriously?
    const sec_dev_cls_str = sec_dev_classes.map(e => `'${e}'`)
    const rev_open_close_str = rev_open_close.map(e => `'${e}'`)

    const device_class_settings = {
      alarm_control_panel: [ 'mdi:shield-lock', '#4caf50', 'security' ],
      climate: [ 'mdi:thermostat', '#2196f3', 'climate' ],
      cover: [ 'mdi:blinds-horizontal', 'blue', 'climate' ],
      fan: [ 'mdi:fan', '#4caf50', 'climate' ],
      humidity: [ 'mdi:water-percent', 'blue', 'humidity' ],
      irrigation: [ 'mdi:sprinkler', 'blue', 'water' ],
      light: [ 'mdi:lightbulb-multiple', '#ff9800', 'light' ],
      motion: [ 'mdi:motion-sensor', 'grey', 'security' ],
      media_player: [ 'mdi:music', 'grey', 'media' ],
      security: [ 'mdi:security', '#67e3e0', 'security' ],
      temperature: [ 'mdi:thermometer', 'blue', 'temperature' ],
    }

    const view_badges = {
      '__all_areas': ['temperature', 'humidity', 'light', 'cover', 'fan', 'security',
                          'media_player', 'climate', 'alarm_control_panel', 'irrigation'],
      'home': ['motion', 'light', 'fan', 'cover', 'security', 'alarm_control_panel',
                          'media_player', 'climate', 'irrigation'],
      'climate': ['temperature', 'humidity', 'fan', 'cover', 'climate'],
      'light': [ 'light' ],
      'media': [ 'media_player' ],
      'security': ['motion', 'security', 'alarm_control_panel'],
      'water': ['fan', 'humidity', 'irrigation'],
      'garden': ['fan', 'humidity', 'irrigation'],
    }

    function get_attr(entity, attr) {
      // console.info('GET ATTR (VIEW)', entity.entity_id, attr)
      const state = hass.states[entity.entity_id]
      if (state)
        return state['attributes'][attr]
      return null
    }

    function gen_entity_card(entity, view=null) {
      // console.info('GET ENTITY CARD', entity.entity_id, view)
      const domain = entity.entity_id.split('.')[0]
      const on_home_view = (view == null || view.area_id == 'home')
      const entity_name = get_attr(entity, 'friendly_name')
      const entity_area = areas.find(a => a.area_id == entity.area_id).name.toLocaleLowerCase() || null
      const gen_func = `gen_${domain}_card`
      let card = {}

      try {
        card = eval(gen_func)(entity, on_home_view)
      } catch(error) {
        if (error.name == 'ReferenceError')
          card = gen_basic_card(entity, on_home_view)
        else
          throw(error)
      }
      if (view &&
          (entity_name.length > entity_area.length + 1) &&
          entity_name.toLocaleLowerCase().startsWith(`${entity_area} `)) {
        card['name'] = entity_name.slice(entity_area.length + 1)
      }
      if (get_attr(entity, 'entity_picture'))
            card['icon_type'] = 'entity-picture'
      card['card_mod'] = is_card_active(entity)

      return card
    }

    function gen_basic_card(entity, on_home_view) {
      // console.info('GEN BASIC CARD', entity.entity_id)
      return {
        type: 'custom:mushroom-entity-card',
        entity: entity.entity_id,
      }
    }

    function gen_alarm_control_panel_card(entity, on_home_view) {
      // console.info('GEN ALARM CARD', entity.entity_id)
      const card = {
        type: 'custom:mushroom-alarm-control-panel-card',
        entity: entity.entity_id,
      }

      if (!on_home_view) {
        const supported_features = get_attr(entity, 'supported_features')
        const states = []

        if (supported_features & 0x1) states.push('armed_home')
        if (supported_features & 0x2) states.push('armed_away')
        if (supported_features & 0x4) states.push('armed_night')
        // Don't show these on card, activate via popup
        // if (supported_features & 0x10) states.push('armed_custom_bypass')
        // if (supported_features & 0x20) states.push('armed_vacation')
        card['states'] = states

        card['layout'] = 'horizontal'
      }

      // console.info('ALARM CARD', card)

      return card
    }

    function gen_climate_card(entity, on_home_view) {
      // console.info('GEN CLIMATE CARD', entity.entity_id)
      const card = {
        type: 'custom:mushroom-climate-card',
        entity: entity.entity_id,
        tap_action: {
          action: 'more-info',
        },
      }

      if (!on_home_view) {
        const modes = get_attr(entity, 'hvac_modes')

        if (modes)
          card['hvac_modes'] = modes
        card['layout'] = 'horizontal'
      }

      // console.info('CLIMATE CARD', card)

      return card
    }

    function gen_cover_card(entity, on_home_view) {
      // console.info('GEN COVER CARD', entity.entity_id)
      const card = {
        type: 'custom:mushroom-cover-card',
        entity: entity.entity_id,
        show_buttons_control: !on_home_view,
      }

      if (!on_home_view) {
        const supported_features = get_attr(entity, 'supported_features')
        const can_position = (supported_features & 0x4) != 0

        card['show_position_control'] = can_position
        card['layout'] = 'horizontal'
      }

      // console.info('COVER CARD', card)

      return card
    }

    function gen_fan_card(entity, on_home_view) {
      // console.info('GEN FAN CARD', entity.entity_id)
      const card = {
        type: 'custom:mushroom-fan-card',
        entity: entity.entity_id,
        icon_animation: true,
      }

      if (!on_home_view) {
        const supported_features = get_attr(entity, 'supported_features')
        const can_set_speed = (supported_features & 0x1) != 0
        const can_oscillate = (supported_features & 0x2) != 0
        const can_set_direction = (supported_features & 0x4) != 0

        card['show_percentage_control'] = can_set_speed
        card['show_oscillate_control'] = can_oscillate
        card['show_direction_control'] = can_set_direction
        card['layout'] = 'horizontal'
      }

      // console.info('FAN CARD', card)

      return card
    }

    function gen_light_card(entity, on_home_view) {
      // console.info('GEN LIGHT CARD', entity.entity_id)
      const card = {
        type: 'custom:mushroom-light-card',
        entity: entity.entity_id,
        use_light_color: !on_home_view
      }

      if (!on_home_view) {
        const supported_color_modes = get_attr(entity, 'supported_color_modes')
        if (supported_color_modes != null) {
          let onoff = false, brightness = false, color_temp = false, color = false,
          scm = supported_color_modes[0]

          onoff = scm == 'onoff'
          brightness = [ 'brightness', 'color_temp', 'hs', 'xy',
                          'rgb', 'rgbw', 'rgbww' ].includes(scm)
          color_temp = scm == 'color_temp'
          color = [ 'hs', 'xy', 'rgb', 'rgbw', 'rgbww' ].includes(scm)

          card['show_brightness_control'] = brightness
          card['show_color_temp_control'] = color_temp
          card['show_color_control'] = color
          card['layout'] = onoff ? 'default' : 'horizontal'
        }
      }

      // console.info('LIGHT CARD', card)

      return card
    }

    function gen_lock_card(entity, on_home_view) {
      // console.info('GEN LOCK CARD', entity.entity_id)
      const card = {
        type: 'custom:mushroom-lock-card',
        entity: entity.entity_id,
        layout: 'horizontal',
        grid_options: {
          columns: 6,
          rows: 1
        },
        tap_action: {
          action: 'toggle',
        },
      }

      // console.info('LOCK CARD', card)

      return card
    }

    function gen_media_player_card(entity, on_home_view) {
      // console.info('GEN MEDIA PLAYER CARD', entity.entity_id)
      const card = {
        type: 'custom:mushroom-media-player-card',
        entity: entity.entity_id,
        use_media_info: true,
        show_volume_level: false,
        icon_type: 'entity-picture',
        tap_action: {
          action: 'more-info'
        },
        hold_action: {
          action: 'none'
        },
        double_tap_action: {
          action: 'none'
        },
      }

      if (!on_home_view) {
        const supported_features = get_attr(entity, 'supported_features')

        if (supported_features) {
          // Stopgap, needs fixing
          card['media_controls'] = [ 'previous', 'play_pause_stop', 'next' ]
          card['layout'] = 'horizontal'
        }
      }

      // console.info('MEDIA PLAYER CARD', card)

      return card
    }

    function gen_sensor_card(entity, on_home_view) {
      // console.info('GEN SENSOR CARD', entity.entity_id)
      const dev_class = get_attr(entity, 'device_class')

      let card = {}
      if (dev_class != null)
        card = gen_sensor_with_devcls_card(entity, dev_class, on_home_view)

      if (card)
        return card
      return gen_basic_card(entity, on_home_view)
    }

    function gen_sensor_with_devcls_card(entity, dev_class, on_home_view) {
      // console.info('GEN SENSOR CARD w/device_class', entity.entity_id, dev_class)
      const settings = device_class_settings[dev_class]
      if (!settings)
        return null

      return {
        type: 'custom:mushroom-template-card',
        entity: entity.entity_id,
        icon: settings[0],
        icon_color: settings[1],
        primary: `{{ state_attr('${entity.entity_id}', 'friendly_name') }}`,
        secondary: `{{ states('${entity.entity_id}',  with_unit=True, rounded=True) }}`,
      }
    }

    function gen_switch_card(entity, on_home_view) {
      // console.info('GEN SWITCH CARD', entity.entity_id)
      const card = {
        type: 'custom:mushroom-entity-card',
        entity: entity.entity_id,
        tap_action: {
          action: 'toggle',
        },
      }
      if (get_attr(entity, 'sprinkler_head_type') )
        card['icon'] = 'mdi:sprinkler-variant'

      // console.info('SWITCH CARD', card)

      return card
    }

    function is_card_active(entity) {
      const domain = entity.entity_id.split('.')[0]
      const gen_func = `is_${domain}_card_active`
      let card = {}

      try {
        card = eval(gen_func)(entity)
      } catch(error) {
        if (error.name == 'ReferenceError')
          card = is_generic_card_active(entity)
        else
          throw(error)
      }
      return card
    }

    function is_generic_card_active(entity, cmp='==', state='on', ha_card_extra='') {
      // console.info('IS CARD ACTIVE', entity.entity_id, cmp, state)
      const style = {
        '.': `ha-card {
                background-color: {{ 'white'
                                     if states(config.entity)${cmp}'${state}' else
                                     'rgba(120, 120, 120, 0.7)' }};
              }${ha_card_extra}`,
        'mushroom-state-info$': `.container { {{
                                   '--card-primary-color: black;
                                    --card-secondary-color: grey;'
                                     if states(config.entity)${cmp}'${state}' else
                                   '--card-primary-color: white;
                                    --card-secondary-color: lightgrey;'
                                 }} }`
      }

      return {
        style: style
      }
    }

    function is_alarm_control_panel_card_active(entity) {
      return is_generic_card_active(entity, '!=', 'disarmed')
    }

    function is_cover_card_active(entity) {
      // console.info('IS COVER ACTIVE', entity.entity_id)
      const dev_class = get_attr(entity, 'device_class')

      if (!rev_open_close.includes(dev_class))
        return is_generic_card_active(entity, '!=', 'closed')

      // reverse open/closed visual style
      const style = {
        '.': `ha-card {
                background-color: {{ 'white'
                                     if states(config.entity)!='open'
                                     else 'rgba(120, 120, 120, 0.7)' }};
              }
              ha-state-icon {
                color: {{ 'rgb(var(--rgb-state-cover-open))'
                          if states(config.entity)!='open'
                          else 'rgb(var(--rgb-state-cover-closed))'
                       }};
              }`,
        'mushroom-shape-icon$': `.shape {
                                   background-color: {{ 'rgba(var(--default-blue), 0.2)'
                                                        if states(config.entity)!='open'
                                                        else 'var(--shape-color-disabled)'
                                                     }} !important;
                                 }`,
        'mushroom-state-info$': `.container { {{
                                   '--card-primary-color: black;
                                    --card-secondary-color: grey;'
                                     if states(config.entity)!='open' else
                                   '--card-primary-color: white;
                                    --card-secondary-color: lightgrey;'
                                 }} }`
      }

      const card = {
        style: style
      }

      // console.info('COVER ACTIVE', card)

      return card
    }

    function is_lock_card_active(entity) {
      // This hides the button
      const no_button = "\nha-card div.actions { display: none; }"
      const card = is_generic_card_active(entity, '!=', 'locked', no_button)

      return card
    }

    function is_media_player_card_active(entity) {
      return is_generic_card_active(entity, '==', 'playing')
    }

    function gen_badge(type, view=null) {
      // console.info('GEN BADGE', type, view)
      const gen_func = `gen_${type}_badge`
      let badge = {}

      try {
        badge = eval(gen_func)(type, view)
      } catch(error) {
        if (error.name == 'ReferenceError')
          badge = gen_missing_badge(type)
        else
          throw(error)
      }
      return badge
    }

    function gen_missing_badge(type) {
      return {
        type: 'custom:mushroom-template-badge',
        content: `No badge: ${type}`,
        icon: 'mdi:alert',
        color: 'red',
      }
    }

    function badge_entities(view) {
      if (view) {
        return `area_entities('${view.area_id}') | reject('is_hidden_entity')`
      } else {
        return "label_entities('in_summaries')"
      }
    }

    function gen_count_badge(type, counter, sum=null) {
      const settings = device_class_settings[type]
      let count = ''
      let display = ''

      // NOTE: messy, explain
      if (sum == null) {
        count = `{{ ${counter} }}`
        display = `{{ 'display: none' if ${counter}|int==0 }}`
      } else {
        count = `${counter}{{ ${sum} }}`
        display = `${counter}{{ 'display: none' if ${sum}|int==0 }}`
      }

      return {
        type: 'custom:mod-card',
        card: {
          type: 'custom:mushroom-template-badge',
          content: count,
          icon: settings[0],
          color: settings[1],
          tap_action: {
            action: 'navigate',
            navigation_path: `/${dashboard_name}/${settings[2]}`
          }
        },
        card_mod: {
          style: `ha-card { ${display} }`
        }
      }
    }

    function gen_range_badge(type, view) {
      // console.info('GEN RANGE BADGE', type, view)
      const settings = device_class_settings[type]
      const entities = badge_entities(view)
      let navtgt = ''

      if (view) {
        navtgt = `${view.area_id}_${type}`
      } else {
        navtgt = type
      }

      const range = `
{% set s = expand(${entities})|
   selectattr('attributes.device_class', 'defined')|
   selectattr('attributes.device_class', 'eq', '${type}')|
   selectattr('state', 'is_number')|
   map(attribute='state')|
   map('round')|
   list
%}
{% set l, h = min(s), max(s) %}
{% set d = (l - h)|abs() %}
{{ h if d < 2 else l|string + '-' + h|string }}`

      const exists = `
        expand(${entities}) |
        selectattr('attributes.device_class', 'defined') |
        selectattr('attributes.device_class', 'eq', '${type}') |
        selectattr('entity_id', 'has_value') |
        list |
        count
      `

      return {
        type: 'custom:mod-card',
        card: {
          type: 'custom:mushroom-template-badge',
          content: `${range}`,
          icon: settings[0],
          color: settings[1],
          tap_action: {
            action: 'navigate',
            navigation_path: `/${dashboard_name}/${navtgt}`
          }
        },
        card_mod: {
          style: `ha-card { {{ 'display: none' if ${exists}|int==0 }} }`
        }
      }
    }

    function gen_alarm_control_panel_badge(type, view) {
      const entities = badge_entities(view)

      const counter = `
        ${entities} |
        select('match', '${type}\\.') |
        reject('is_state', 'disarmed') |
        list |
        count`

      return gen_count_badge(type, counter)
    }

    function gen_climate_badge(type, view) {
      const entities = badge_entities(view)

      const counter = `
        ${entities} |
        select('match', '${type}\\.') |
        expand |
        selectattr('attributes.hvac_action', 'defined') |
        selectattr('attributes.hvac_action', 'ne', 'idle') |
        selectattr('entity_id', 'has_value') |
        map(attribute='entity_id') |
        list |
        count`

      return gen_count_badge(type, counter)
    }

    function gen_cover_badge(type, view) {
      const entities = badge_entities(view)

      const counter = `
{% set c = ${entities}
   |select('match', '${type}\\.')
   |expand
   |rejectattr('attributes.device_class', 'in', [${sec_dev_cls_str}])
   |selectattr('entity_id', 'has_value')
   |list
%}
{% set open = c
   |rejectattr('attributes.device_class', 'in', [${rev_open_close_str}])
   |rejectattr('state', 'eq', 'closed')
   |list
%}
{% set closed = c
   |selectattr('attributes.device_class', 'in', [${rev_open_close_str}])
   |rejectattr('state', 'eq', 'open')
   |list
%}`
      const sum = "(open+closed)|list|count"

      return gen_count_badge(type, counter, sum)
    }

    function gen_fan_badge(type, view) {
      const entities = badge_entities(view)

      const counter = `
        ${entities} |
        select('match', '${type}\\.') |
        select('is_state', 'on') |
        list |
        count`

      return gen_count_badge(type, counter)
    }

    function gen_humidity_badge(type, view) {
      // console.info('GEN TEMP BADGE', type, view)
      return gen_range_badge(type, view)
    }

    function gen_irrigation_badge(type, view) {
      const entities = badge_entities(view)

      // This is Rainmachine-specific
      const counter = `
        ${entities} |
        select('match', 'switch\\.') |
        expand |
        selectattr('attributes.sprinkler_head_type', 'defined') |
        selectattr('entity_id', 'has_value') |
        map(attribute='entity_id') |
        select('is_state', 'on') |
        list |
        count`

      return gen_count_badge(type, counter)
    }

    function gen_light_badge(type, view) {
      let entities = badge_entities(view)
      if (view != null) {
        // don't count light groups in areas
        entities += ` |
            expand |
            rejectattr('attributes.entity_id', 'defined') |
            map(attribute='entity_id')`
      }

      const counter = `
        ${entities} |
        select('match', '${type}\\.') |
        select('is_state', 'on') |
        list |
        count`

      return gen_count_badge(type, counter)
    }

    function gen_media_player_badge(type, view) {
      const entities = badge_entities(view)

      const counter = `
        ${entities} |
        select('match', '${type}\\.') |
        select('is_state', 'playing') |
        list |
        count`

      return gen_count_badge(type, counter)
    }

    function gen_motion_badge(type, view) {
      const entities = badge_entities(view)

      const counter = `
        ${entities} |
        select('match', 'binary_sensor\\.') |
        expand |
        selectattr('attributes.device_class', 'defined') |
        selectattr('attributes.device_class', 'eq', 'motion') |
        selectattr('entity_id', 'has_value') |
        map(attribute='entity_id') |
        select('is_state', 'on') |
        list |
        count`

      return gen_count_badge(type, counter)
    }

    function gen_security_badge(type, view) {
      const entities = badge_entities(view)

      const counter = `
{% set l = ${entities}
   |select('match', 'lock\\.')
   |reject('is_state', 'locked')
   |expand
   |list
%}
{% set b = ${entities}
   |select('match', 'binary_sensor\\.')
   |expand
   |selectattr('attributes.device_class', 'defined')
   |selectattr('attributes.device_class', 'in', [${sec_dev_cls_str}])
   |rejectattr('state', 'eq', 'off')
   |list
%}
{% set c = ${entities}
   |select('match', 'cover\\.')
   |expand
   |selectattr('attributes.device_class', 'defined')
   |selectattr('attributes.device_class', 'in', [${sec_dev_cls_str}])
   |rejectattr('state', 'eq', 'closed')
   |list
%}`
      const sum = "(l+b+c)|selectattr('entity_id', 'has_value')|list|count"

      return gen_count_badge(type, counter, sum)
    }

    function gen_temperature_badge(type, view) {
      // console.info('GEN TEMP BADGE', type, view)
      return gen_range_badge(type, view)
    }

    function gen_view_header(name=null) {
      // console.info('GEN VIEW HEADER', name)
      const header = {
        layout: 'responsive',
        badges_wrap: 'scroll',
      }

      if (name != null) {
        header['card'] = {
          type: 'heading',
          heading_style: 'title',
          heading: name,
          card_mod: {
            style: `ha-card div.content.title {
                      font-size: 28px;
                      font-weight: 692;
                      line-height: 32px;
                      color: white;
                    }`
          }
        }
      }

      return header
    }

    function gen_section_header(name, navtgt=null, is_list=false) {
      const card = {
        type: 'heading',
        heading_style: 'title',
        heading: name,
        card_mod: {
          style: `ha-card div.content.title {
                    color: {{ 'grey' if ${is_list} else 'white' }};
                    font-size: 18px;
                    font-weight: 450;
                  }`
        }
      }
      if (navtgt) {
        card['tap_action'] = {
          action: 'navigate',
          navigation_path: `/${dashboard_name}/${navtgt}`
        }
      }
      return card
    }

    function gen_home_sections(view) {
      // console.info('GEN HOME SECTIONS', view)
      const sections = [];

      const favorites = entities.filter(e => (e && e.labels.includes('favorite')))
      const on_home_view = entities.filter(e => (e && e.labels.includes('on_home_view')))

      if (favorites.length) {
        let cards = [ gen_section_header('Favorites') ]
        cards.push(...favorites.map(e => gen_entity_card(e)))
        sections.push({
          type: "grid",
          cards,
        })
      }

      if (on_home_view.length) {
        for (const area of areas) {
          let cards = [ gen_section_header(area.name, area.area_id) ]
          cards.push(...on_home_view.filter(e => e.area_id == area.area_id).map(e => gen_entity_card(e, view)))
          sections.push({
            type: "grid",
            cards,
          })
        }
      }

      // filter out sections with only a single (i.e. the heading) card
      return sections.filter(s => s['cards'].length > 1)
    }

    function gen_view_sections(view) {
      // console.info('GEN VIEW SECTIONS', view)
      const sections = [];

      for (const area of areas) {
        let area_domain_entities = entities.filter(e => e.area_id == area.area_id && view.domains && view.domains.includes(e._domain))
        if (area_domain_entities) {
          let cards = [ gen_section_header(area.name, area.area_id) ]
          cards.push(...area_domain_entities.map(e => gen_entity_card(e, view)))
          sections.push({
            type: "grid",
            cards,
          })
        }
      }

      // filter out sections with only a single (i.e. the heading) card
      return sections.filter(s => s['cards'].length > 1)
    }

    function gen_area_sections(area) {
      // console.info('GEN AREA SECTIONS', area)
      const sections = [];

      const area_entities = entities.filter(e => e.area_id == area.area_id)

      for (const view_type of views) {
        if (view_type.area_id == 'home')
          continue

        let section_entities = area_entities.filter(e =>
              view_type.domains && view_type.domains.includes(e._domain))

        if (section_entities.length) {
          let cards = [ gen_section_header(view_type.name, view_type.area_id) ]
          cards.push(...section_entities.map(e => gen_entity_card(e, view)))
          sections.push({
            type: "grid",
            cards,
          })
        }
      }

      // filter out sections with only a single (i.e. the heading) card
      return sections.filter(s => s['cards'].length > 1)
    }

    function gen_list_sections(kind, area_id=null) {
      // console.info('GEN LIST SECTIONS', kind, area_id)
      let sections = []
      let list_entities = []

      let kind_entities = entities.filter(e => get_attr(e, 'device_class') == kind)

      if (area_id != null) {
        list_entities = kind_entities.filter(e => e.area_id == area_id)
      } else {
        list_entities = kind_entities.filter(e => e.labels.includes('in_summaries'))
      }

      if (list_entities.length) {
        for (const area of areas) {
          if (area_id == null || area_id == area.area_id) {
            let cards = [ gen_section_header(area.name, area.area_id, true) ]
            cards.push(...list_entities.filter(e => e.area_id == area.area_id).map(e => gen_entity_card(e, area)))
            sections.push({
              type: "grid",
              cards,
            })
          }
        }
      }

      // filter out sections with only a single (i.e. the heading) card
      return sections.filter(s => s['cards'].length > 1)
    }

    function gen_view(view) {
      // console.info('GEN VIEW', view)
      let sections = []

      const page = {
        header: gen_view_header(view.name),
      };

      const badge_list = view_badges[view.area_id] || []
      if (badge_list.length > 0)
        page['badges'] = badge_list.map((badge) => gen_badge(badge))

      if (view.area_id == 'home')
        sections = gen_home_sections(view)
      else
        sections = gen_view_sections(view)
      if (sections.length > 0)
        page['sections'] = sections

      return page
    }

    function gen_area(area) {
      // console.info('GEN AREA', area)
      let sections = []

      const page = {
        header: gen_view_header(),
      };

      const badge_list = view_badges[area.area_id] || view_badges['__all_areas'] || []
      if (badge_list.length > 0)
        page['badges'] = badge_list.map((badge) => gen_badge(badge, area))

      sections = gen_area_sections(area)
      if (sections.length > 0)
        page['sections'] = sections

      return page
    }

    function gen_list(kind, view=null) {
      // console.info('GEN LIST', kind, view)
      let sections = []

      const page = {
        header: gen_view_header(),
      }

      sections = gen_list_sections(kind, view)
      if (sections.length > 0)
        page['sections'] = sections

      return page
    }

    function genit() {
      // console.info('GENIT', view)

      if (views.indexOf(view) >= 0) {
        return gen_view(view)
      }

      if (areas.indexOf(view) >= 0) {
        return gen_area(view)
      }

      if (lists.indexOf(view) >= 0) {
        const list = view.area_id
        if (['temperature', 'humidity'].includes(list))
          return gen_list(list)
        const list_parts = list.split('_')
        const area = list_parts.slice(0, -1).join('_')
        const kind = list_parts.slice(-1)[0]
        return gen_list(kind, area)
      }

      return {}
    }

    return genit();
  }
}

customElements.define("ll-strategy-dashboard-homekit-dashboard", StrategyHomekitDashboard);
customElements.define("ll-strategy-view-homekit-dashboard", StrategyHomekitDashboardView);
