define([], function(){

  function random (n) { return Math.floor(Math.random() * n); }

  var default_query = {
    'seed':             Date.now(),
    'projection':       'square',
    'palette':          'atlas',
    'pct_water':        random(50) + 25,
    'pct_ice':          random(10) + 5,
    'height':           400,
    'iter':             5000,
    'rotate':           0
  };
  var max_height      = 1000;
  var max_iter        = 25000;


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// palettes

  var palette = {
    'olsson': {                         // john olsson
      'title':          'Olsson',
      'sea': [
        [0x00,0x00,0x44], [0x00,0x11,0x66], [0x00,0x33,0x88],
        [0x00,0x55,0xAA], [0x00,0x77,0xBB], [0x00,0x99,0xDD],
        [0x00,0xCC,0xFF], [0x22,0xDD,0xFF], [0x44,0xEE,0xFF],
        [0x66,0xFF,0xFF], [0x77,0xFF,0xFF], [0x88,0xFF,0xFF],
        [0x99,0xFF,0xFF], [0xAA,0xFF,0xFF], [0xBB,0xFF,0xFF]
      ],
      'land': [
        [0x00,0x44,0x00], [0x22,0x66,0x00], [0x22,0x88,0x00],
        [0x77,0xAA,0x00], [0xBB,0xDD,0x00], [0xFF,0xBB,0x22],
        [0xEE,0xAA,0x22], [0xDD,0x88,0x22], [0xCC,0x88,0x22],
        [0xBB,0x66,0x22], [0xAA,0x55,0x22], [0x99,0x55,0x22],
        [0x88,0x44,0x22], [0x77,0x33,0x22], [0x55,0x33,0x11],
        [0x44,0x22,0x00]
      ]
    },
    'mogensen': {                       // toben mogensen
      'title':          'Mogensen',
      'sea': [
        [0x00,0x00,0xC0], [0x00,0x09,0xC4], [0x00,0x12,0xC9],
        [0x00,0x1B,0xCD], [0x00,0x24,0xD2], [0x00,0x2D,0xD6],
        [0x00,0x36,0xDB], [0x00,0x40,0xDF], [0x00,0x49,0xE4],
        [0x00,0x52,0xE8], [0x00,0x5B,0xED], [0x00,0x64,0xF1],
        [0x00,0x6D,0xF6], [0x00,0x76,0xFA], [0x00,0x80,0xFF]
      ],
      'land': [
        [0x00,0x60,0x00], [0x00,0x80,0x00], [0x00,0xA0,0x00],
        [0x00,0xC0,0x00], [0x00,0xE0,0x00], [0x20,0xD4,0x00],
        [0x40,0xC8,0x00], [0x60,0xBC,0x00], [0x80,0xB0,0x00],
        [0x80,0xA4,0x20], [0x80,0x98,0x40], [0x80,0x8C,0x60],
        [0x80,0x80,0x80], [0xAA,0xAA,0xAA], [0xD4,0xD4,0xD4],
        [0xFF,0xFF,0xFF]
      ]
    },
    'atlas': {
      'title':          'Atlas',
      'sea': [
        [0x80,0xB0,0xBD], [0x86,0xB5,0xC1], [0x8D,0xBA,0xC6],
        [0x94,0xBF,0xCA], [0x9A,0xC4,0xCF], [0xA1,0xC9,0xD4],
        [0xA8,0xCE,0xD8], [0xAF,0xD3,0xDD], [0xB5,0xD8,0xE2],
        [0xBC,0xDD,0xE6], [0xC3,0xE2,0xEB], [0xCA,0xE8,0xF0],
        [0xCA,0xE8,0xF0], [0xCA,0xE8,0xF0], [0xCA,0xE8,0xF0]
      ],
      'land': [
        [0x84,0xB6,0x77], [0x93,0xBD,0x80], [0xA2,0xC5,0x8A],
        [0xB1,0xCC,0x93], [0xC0,0xD4,0x9D], [0xCF,0xDB,0xA6],
        [0xDE,0xE3,0xB0], [0xED,0xEB,0xBA], [0xE0,0xD9,0xAF],
        [0xD3,0xC7,0xA3], [0xC6,0xB5,0x98], [0xB9,0xA3,0x8C],
        [0xCA,0xBA,0xA8], [0xDC,0xD1,0xC5], [0xED,0xE8,0xE2],
        [0xFF,0xFF,0xFF]
      ]
    },
    'antique': {
      'title':          'Antique',
      'set':            { 'pct_ice': 0 },
      'sea': [
        [0xEB,0xD2,0xB0], [0xE8,0xD0,0xAE], [0xE5,0xCD,0xAC],
        [0xE2,0xCA,0xAA], [0xDF,0xC8,0xA7], [0xDC,0xC5,0xA5],
        [0xD9,0xC2,0xA3], [0xD6,0xC0,0xA0],
        [0xD3,0xBD,0x9E], [0xD0,0xBA,0x9C], [0xCC,0xB7,0x99],
        [0x99,0x8A,0x73], [0x66,0x5C,0x4D], [0x33,0x2E,0x27],
        [0x00,0x00,0x00]
      ],
      'land': [
        [0xE2,0xCA,0xAA], [0xE2,0xCA,0xAA], [0xE3,0xCB,0xAA],
        [0xE3,0xCB,0xAB], [0xE4,0xCC,0xAB], [0xE5,0xCC,0xAC],
        [0xE5,0xCD,0xAC], [0xE6,0xCD,0xAC], [0xE6,0xCE,0xAD],
        [0xE7,0xCE,0xAD], [0xE8,0xCF,0xAE], [0xE8,0xCF,0xAE],
        [0xE9,0xD0,0xAE], [0xE9,0xD0,0xAF], [0xEA,0xD1,0xAF],
        [0xEB,0xD2,0xB0]
      ]
    },
    'barren': {
      'title':          'Barren',
      'sea': [
        [0x00,0x00,0xC0], [0x00,0x09,0xC4], [0x00,0x12,0xC9],
        [0x00,0x1B,0xCD], [0x00,0x24,0xD2], [0x00,0x2D,0xD6],
        [0x00,0x36,0xDB], [0x00,0x40,0xDF], [0x00,0x49,0xE4],
        [0x00,0x52,0xE8], [0x00,0x5B,0xED], [0x00,0x64,0xF1],
        [0x00,0x6D,0xF6], [0x00,0x76,0xFA], [0x00,0x80,0xFF]
      ],
      'land': [
        [0x94,0x64,0x52], [0xA9,0x74,0x54], [0xBE,0x84,0x56],
        [0xD3,0x94,0x58], [0xE8,0xA4,0x5A], [0xEC,0xA8,0x5A],
        [0xF0,0xAC,0x5B], [0xF4,0xB0,0x5B], [0xF8,0xB4,0x5C],
        [0xE4,0xA7,0x60], [0xCF,0x9A,0x64], [0xBA,0x8D,0x68],
        [0xA5,0x80,0x6C], [0xC3,0xAA,0x9D], [0xE1,0xD4,0xCE],
        [0xFF,0xFF,0xFF]
      ]
    },
    'martian': {
      'title':          'Martian',
      'set':            { 'pct_water': 0 },
      'sea': [
        [0x00,0x00,0xC0], [0x00,0x09,0xC4], [0x00,0x12,0xC9],
        [0x00,0x1B,0xCD], [0x00,0x24,0xD2], [0x00,0x2D,0xD6],
        [0x00,0x36,0xDB], [0x00,0x40,0xDF], [0x00,0x49,0xE4],
        [0x00,0x52,0xE8], [0x00,0x5B,0xED], [0x00,0x64,0xF1],
        [0x00,0x6D,0xF6], [0x00,0x76,0xFA], [0x00,0x80,0xFF]
      ],
      'land': [
        [0x94,0x64,0x52], [0xA9,0x74,0x54], [0xBE,0x84,0x56],
        [0xD3,0x94,0x58], [0xE8,0xA4,0x5A], [0xEC,0xA8,0x5A],
        [0xF0,0xAC,0x5B], [0xF4,0xB0,0x5B], [0xF8,0xB4,0x5C],
        [0xE4,0xA7,0x60], [0xCF,0x9A,0x64], [0xBA,0x8D,0x68],
        [0xA5,0x80,0x6C], [0xC3,0xAA,0x9D], [0xE1,0xD4,0xCE],
        [0xFF,0xFF,0xFF]
      ]
    },
    'chthonian': {
      'title':          'Chthonian',
      'set':            { 'pct_ice': 0 },
      'sea': [
        [0xFB,0xE7,0x2E], [0xFB,0xC3,0x2C], [0xFC,0x9E,0x29],
        [0xFD,0x7A,0x27], [0xFE,0x55,0x24], [0xF8,0x4D,0x21],
        [0xF2,0x44,0x1D], [0xEC,0x3C,0x1A], [0xE6,0x33,0x16],
        [0xDF,0x2B,0x12], [0xD9,0x22,0x0F], [0xD3,0x1A,0x0B],
        [0xCD,0x11,0x08], [0xC7,0x09,0x04], [0xC0,0x00,0x00]
      ],
      'land': [
        [0x10,0x10,0x10], [0x14,0x14,0x14], [0x18,0x18,0x18],
        [0x1D,0x1D,0x1D], [0x21,0x21,0x21], [0x25,0x25,0x25],
        [0x2A,0x2A,0x2A], [0x2E,0x2E,0x2E], [0x32,0x32,0x32],
        [0x37,0x37,0x37], [0x3B,0x3B,0x3B], [0x40,0x40,0x40],
        [0x50,0x50,0x50], [0x60,0x60,0x60], [0x70,0x70,0x70],
        [0x80,0x80,0x80]
      ]
    },
    'greyscale': {
      'title':          'Greyscale',
      'set':            { 'pct_water': 0, 'pct_ice': 0 },
      'sea': [
        [0x00,0x00,0xC0], [0x00,0x09,0xC4], [0x00,0x12,0xC9],
        [0x00,0x1B,0xCD], [0x00,0x24,0xD2], [0x00,0x2D,0xD6],
        [0x00,0x36,0xDB], [0x00,0x40,0xDF], [0x00,0x49,0xE4],
        [0x00,0x52,0xE8], [0x00,0x5B,0xED], [0x00,0x64,0xF1],
        [0x00,0x6D,0xF6], [0x00,0x76,0xFA], [0x00,0x80,0xFF]
      ],
      'land': [
        [0x40,0x40,0x40], [0x48,0x48,0x48], [0x51,0x51,0x51],
        [0x59,0x59,0x59], [0x62,0x62,0x62], [0x6A,0x6A,0x6A],
        [0x73,0x73,0x73], [0x7B,0x7B,0x7B], [0x84,0x84,0x84],
        [0x8C,0x8C,0x8C], [0x95,0x95,0x95], [0x9D,0x9D,0x9D],
        [0xA6,0xA6,0xA6], [0xAE,0xAE,0xAE], [0xB7,0xB7,0xB7],
        [0xC0,0xC0,0xC0]
      ]
    },
    'landmask': {
      'title':          'Landmask',
      'set':            { 'pct_ice': 0 },
      'sea': [
        [0x00,0x00,0x00], [0x00,0x00,0x00], [0x00,0x00,0x00],
        [0x00,0x00,0x00], [0x00,0x00,0x00], [0x00,0x00,0x00],
        [0x00,0x00,0x00], [0x00,0x00,0x00], [0x00,0x00,0x00],
        [0x00,0x00,0x00], [0x00,0x00,0x00], [0x00,0x00,0x00],
        [0x00,0x00,0x00], [0x00,0x00,0x00], [0x00,0x00,0x00]
      ],
      'land': [
        [0xFF,0xFF,0xFF], [0xFF,0xFF,0xFF], [0xFF,0xFF,0xFF],
        [0xFF,0xFF,0xFF], [0xFF,0xFF,0xFF], [0xFF,0xFF,0xFF],
        [0xFF,0xFF,0xFF], [0xFF,0xFF,0xFF], [0xFF,0xFF,0xFF],
        [0xFF,0xFF,0xFF], [0xFF,0xFF,0xFF], [0xFF,0xFF,0xFF],
        [0xFF,0xFF,0xFF], [0xFF,0xFF,0xFF], [0xFF,0xFF,0xFF],
        [0xFF,0xFF,0xFF]
      ]
    }
  };

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// worldGen.js // version 1.0
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
  var wc = {
    projection: {
      square: {
        title: "Square"
      },
      mercator: {
        title: "Mercator"
      },
      transmerc: {
        title: "Transverse"
      },
      icosahedral: {
        title: "Icosahedral"
      },
      mollweide: {
        title: "Mollweide"
      },
      sinusoidal: {
        title: "Sinusoidal"
      }
    },
    palette: palette
  };

  function new_world(water, ice, height, rotate, projection, palette) {
    return image_world(create_world(world_query(water, ice, height, rotate, projection, palette)));
  }

  function world_query(water, ice, height, rotate, projection, palette) {
    return {
      seed: Math.round((Math.random() * 100000000) + 999999999),
      algorithm: "voss_a7",
      iter: 500,
      hack_theta: true,
      erode: true,
      pct_water: water || 50,
      pct_ice: ice || 25,
      height: height || 100,
      rotate: rotate || 0,
      projection: projection || 'mercator',
      palette: palette || 'atlas'
    }
  }

  function create_world(a) {
    a = init_world(a);
    if (a.algorithm == "voss") a = voss(a);
    else if (a.algorithm == "voss_x3") a = loop_voss(3, "x", a);
    else if (a.algorithm == "voss_a7") a = loop_voss(7, "a", a);
    if (a.erode) a = erode(a);
    a = flood(a);
    return a = freeze(a)
  }

  function init_world(a) {
    if (a.projection == "mercator" || a.projection == "transmerc") {
      a.rows = a.height * 2;
      a.cols = a.rows * 2
    } else if (a.projection == "icosahedral") {
      a.rows = a.height;
      a.cols = Math.floor(a.rows * 1.9245008973)
    } else {
      a.rows = a.height;
      a.cols = a.rows * 2
    }
    a.map_len = a.rows * a.cols;
    a.rl1 = a.rows - 1;
    a.rd2 = Math.floor(a.rows / 2);
    a.rdp = Math.floor(a.rows / Math.PI);
    a.cd2 = Math.floor(a.cols / 2);
    a.cdp = Math.floor(a.cols / Math.PI);
    a.rpx = Math.floor(a.cols * (a.rotate / 360));
    var b;
    if (b = palette[a.palette]) {
      a.palette = load_palette(b);
    } else a.palette = load_palette(palette.mogensen);
    return a;
  }

  function load_palette(a) {
    var b = {
      n_sea: 50,
      n_land: 100,
      cmap: []
    };
    b.n_terrain = b.n_sea + b.n_land;
    b.n_ice = b.n_land + 1;
    b.sea_idx = 1;
    b.land_idx = b.sea_idx + b.n_sea;
    b.ice_idx = b.land_idx + b.n_land;
    b = sea_cmap(b, a.sea);
    b = land_cmap(b, a.land);
    return b = ice_cmap(b)
  }

  function sea_cmap(a, b) {
    var c = b.length - 1,
        e;
    for (e = a.sea_idx; e < a.land_idx; e++) {
      var d = (e - a.sea_idx) / a.n_sea * c,
          f = Math.floor(d),
          g = f + 1;
      a.cmap[e] = inter_color(b[f], b[g], d - f)
    }
    return a
  }

  function land_cmap(a, b) {
    var c = b.length - 1,
        e;
    for (e = a.land_idx; e < a.ice_idx; e++) {
      var d = (e - a.land_idx) / a.n_land * c,
          f = Math.floor(d),
          g = f + 1;
      a.cmap[e] = inter_color(b[f], b[g], d - f)
    }
    return a
  }

  function ice_cmap(a) {
    var b = a.ice_idx + a.n_ice,
        c = [255, 255, 255],
        e = [175, 175, 175],
        d;
    for (d = a.ice_idx; d < b; d++) {
      var f = (d - a.ice_idx) / (a.n_ice - 1);
      a.cmap[d] = inter_color(c, e, f)
    }
    return a
  }

  function inter_color(a, b, c) {
    var e = Math.floor(a[0] + (b[0] - a[0]) * c),
        d = Math.floor(a[1] + (b[1] - a[1]) * c);
    a = Math.floor(a[2] + (b[2] - a[2]) * c);
    return fmt_color(e, d, a)
  }

  function voss(a) {
    a.map = new_map(a, 0);
    var b = build_siphi(a.cols),
        c;
    for (c = 0; c < a.iter; c++) a = fault(a, b);
    a = aggregate(a);
    return a = normal_map(a)
  }

  function new_map(a, b) {
    var c = [],
        e;
    for (e = 0; e < a.rows; e++) {
      c[e] = [];
      var d;
      for (d = 0; d < a.cols; d++) c[e][d] = b
    }
    return c
  }

  function build_siphi(a) {
    var b = [],
        c;
    for (c = 0; c < a; c++) b[c] = Math.sin(c / a * 2 * Math.PI);
    return b
  }

  function fault(a, b) {
    var c = (rand_x(1) - 0.5) * Math.PI,
        e = rand_x(1) - 0.5,
        d = e * Math.PI;
    e = Math.floor(a.cd2 - a.cols * e);
    c = Math.tan(Math.acos(Math.cos(c) * Math.cos(d)));
    if (isNaN(c)) return a;
    var f, g;
    d = random(100) < 50 ? 1 : -1;
    if (a.hack_theta) {
      f = rand_x(0.5) + 0.5;
      g = Math.floor(rand_x((1 - f) * a.rl1)) + 1
    }
    var h;
    for (h = 0; h < a.cols; h++) {
      var i = (e - h + a.cols) % a.cols;
      i = b[i] * c;
      i = Math.floor(Math.atan(i) * a.rdp);
      if (!isNaN(i)) {
        i = i + a.rd2;
        if (a.hack_theta) i = Math.floor(i * f) + g;
        a.map[i][h] += d
      }
    }
    return a
  }

  function rand_x(a) {
    return random(32767) / 32767 * a
  }

  function aggregate(a) {
    var b;
    for (b = 1; b < a.rows; b++) {
      var c;
      for (c = 0; c < a.cols; c++) a.map[b][c] += a.map[b - 1][c]
    }
    return a
  }

  function normal_map(a) {
    var b = 2147483647,
        c;
    for (c = 0; c < a.rows; c++) {
      var e;
      for (e = 0; e < a.cols; e++)
        if (a.map[c][e] < b) b = a.map[c][e]
    }
    for (c = 0; c < a.rows; c++)
      for (e = 0; e < a.cols; e++) a.map[c][e] -= b - 1;
    return a
  }

  function loop_voss(a, b, c) {
    var e = new_map(c, 1),
        d = c.iter;
    c.iter = Math.floor(d / a);
    var f;
    for (f = 0; f < a; f++) {
      c = voss(c);
      if (b == "x") e = compile_x(e, c);
      else if (b == "a") e = compile_a(e, c);
      c.map = false
    }
    c.iter = d;
    c.map = e;
    return c
  }

  function compile_a(a, b) {
    var c;
    for (c = 0; c < b.rows; c++) {
      var e;
      for (e = 0; e < b.cols; e++) {
        a[c][e] += b.map[c][e];
        a[c][e] /= 2
      }
    }
    return a
  }

  function compile_x(a, b) {
    var c;
    for (c = 0; c < b.rows; c++) {
      var e;
      for (e = 0; e < b.cols; e++) a[c][e] *= b.map[c][e]
    }
    return a
  }

  function erode(a) {
    var b = new_map(a, 0),
        c;
    for (c = 0; c < a.rows; c++) {
      var e;
      for (e = 0; e < a.cols; e++) b[c][e] = sum_area(a, c, e) / 9
    }
    a.map = b;
    return normal_map(a)
  }

  function sum_area(a, b, c) {
    return get_z(a, b - 1, c - 1) + get_z(a, b, c - 1) + get_z(a, b + 1, c - 1) + get_z(a, b - 1, c) + get_z(a, b, c) + get_z(a, b + 1, c) + get_z(a, b - 1, c + 1) + get_z(a, b, c + 1) + get_z(a, b + 1, c + 1)
  }

  function get_z(a, b, c) {
    if (b >= 0 && b < a.rows && c >= 0 && c < a.cols) return a.map[b][c];
    else {
      b = map_idx(a, b, c);
      return a.map[b.row][b.col]
    }
  }

  function set_z(a, b, c, e) {
    if (b >= 0 && b < a.rows && c >= 0 && c < a.cols) a.map[b][c] = e;
    else {
      b = map_idx(a, b, c);
      a.map[b.row][b.col] = e
    }
  }

  function map_idx(a, b, c) {
    for (; b < 0;) b += a.rows * 2;
    if (b >= a.rows * 2) b %= a.rows * 2;
    if (b >= a.rows) {
      b = a.rows * 2 - (b + 1);
      c += Math.floor(a.cols / 2)
    }
    for (; c < 0;) c += a.cols;
    if (c >= a.cols) c %= a.cols;
    return {
      row: b,
      col: c
    }
  }

  function flood(a) {
    var b = a.palette,
        c = 2147483647,
        e = 0,
        d;
    for (d = 0; d < a.rows; d++) {
      var f;
      for (f = 0; f < a.cols; f++) {
        if (a.map[d][f] < c) c = a.map[d][f];
        if (a.map[d][f] > e) e = a.map[d][f]
      }
    }
    var g = b.n_terrain,
        h = e - c;
    h = (g - 1) / h;
    var i = [];
    for (d = 0; d < g; d++) i[d] = 0;
    for (d = 1; d < a.rows; d++)
      for (f = 0; f < a.cols; f++) {
        var k = Math.floor((a.map[d][f] - c) * h);
        i[k]++
      }
    d = a.pct_water / 100;
    k = Math.floor(a.map_len * d);
    f = 0;
    var j;
    for (d = 0; d < g; d++) {
      f += i[d];
      if (f > k) {
        j = d;
        break
      }
    }
    g = Math.floor(j / h) + c;
    j = b.n_sea / (g - c + 1);
    e = b.n_land / (e - g + 1);
    for (d = 0; d < a.rows; d++)
      for (f = 0; f <
      a.cols; f++)
        if (a.map[d][f] < g) {
          h = a.map[d][f] - c;
          a.map[d][f] = Math.floor(h * j) + b.sea_idx
        } else {
          h = a.map[d][f] - g;
          a.map[d][f] = Math.floor(h * e) + b.land_idx
        }
    return a
  }

  function freeze(a) {
    var b = a.palette;
    if (a.pct_ice > 0) {
      var c = a.pct_ice / 100;
      c = Math.floor(a.map_len * c / 2);
      var e = 0,
          d;
      for (d = 0; d < a.rows; d++) {
        var f;
        for (f = 0; f < a.cols; f++) {
          if (a.map[d][f] < b.ice_idx) {
            var g = a.map[d][f];
            e += ice_over(a, d, f, g, 0)
          }
          if (e > c) break
        }
        if (e > c) break
      }
      e = 0;
      for (d = a.rl1; d > 0; d--) {
        for (f = 0; f < a.cols; f++) {
          if (a.map[d][f] < b.ice_idx) {
            g = a.map[d][f];
            e += ice_over(a, d, f, g, 0)
          }
          if (e > c) break
        }
        if (e > c) break
      }
    }
    return a
  }

  function ice_over(a, b, c, e, d) {
    var f = a.palette,
        g = get_z(a, b, c),
        h = 0;
    if (g == e) {
      if (g >= f.land_idx) {
        f = g - f.land_idx + f.ice_idx + 1;
        set_z(a, b, c, f)
      } else set_z(a, b, c, f.ice_idx);
      h++;
      if (d++ < a.height / 6) {
        h += ice_over(a, b, c - 1, e, d);
        h += ice_over(a, b, c + 1, e, d);
        if (b > 1) h += ice_over(a, b - 1, c, e, d);
        if (b < a.rl1) h += ice_over(a, b + 1, c, e, d)
      }
    }
    return h
  }
  var phi_x = [],
      edge_c = [],
      xlate_r = [],
      xlate_c = [];

  function image_world(a) {
    var b = scale_world(a),
        c = new_image(b.width, b.height);
    cache_pixels(true);
    if (a.projection == "mercator") image_mercator(a, b, c);
    else if (a.projection == "transmerc") image_transmerc(a, b, c);
    else if (a.projection == "icosahedral") image_icosahedral(a, b, c);
    else if (a.projection == "mollweide") image_mollweide(a, b, c);
    else a.projection == "sinusoidal" ? image_sinusoidal(a, b, c) : image_square(a, b, c);
    dump_pixels(c);
    return c;
  }

  function new_image(a, b) {
    var c = worldGen.targetCanvas;
    c.width = a;
    c.height = b;
    c = c.getContext("2d");
    fill_rect(c, 0, 0, a, b, "#ffffff");
    return c
  }

  function scale_world(a) {
    var b = {};
    if (a.projection == "mercator" || a.projection == "transmerc") {
      b.height = a.height;
      b.width = Math.floor(a.height * (Math.PI / 2))
    } else if (a.projection == "icosahedral") {
      b.height = a.height;
      b.width = Math.floor(a.height * 2.116950987);
      b.col_w = b.width / 11;
      b.row_h = b.height / 3
    } else {
      b.height = a.rows;
      b.width = a.cols
    }
    if (a.projection == "mollweide" || a.projection == "sinusoidal") b.wd2 = Math.floor(b.width / 2);
    return b
  }

  function image_square(a, b, c) {
    var e = a.palette.cmap,
        d;
    for (d = 0; d < b.width; d++) {
      var f;
      for (f = 0; f < b.height; f++) {
        var g = normal_z(a, f, d);
        g > 0 && set_pixel(c, d, f, e[g])
      }
    }
  }

  function image_mercator(a, b, c) {
    var e = a.palette.cmap,
        d;
    for (d = 0; d < b.width; d++) xlate_c[d] = Math.floor(d / b.width * a.cols);
    var f;
    for (f = 0; f < b.height; f++) {
      d = (0.5 - f / b.height) * Math.PI;
      d = Math.atan(Math.sinh(d));
      xlate_r[f] = Math.floor((0.5 - d / Math.PI) * a.rows)
    }
    for (d = 0; d < b.width; d++)
      for (f = 0; f < b.height; f++) {
        var g = mercator_z(a, b, d, f);
        g > 0 && set_pixel(c, d, f, e[g])
      }
  }

  function mercator_z(a, b, c, e) {
    return normal_z(a, xlate_r[e], xlate_c[c])
  }

  function image_transmerc(a, b, c) {
    var e = a.palette.cmap,
        d;
    for (d = 0; d < b.width; d++) {
      var f;
      for (f = 0; f < b.height; f++) {
        var g = transmerc_z(a, b, d, f);
        g > 0 && set_pixel(c, d, f, e[g])
      }
    }
  }

  function transmerc_z(a, b, c, e) {
    c = c / b.width * 2 * Math.PI;
    e = (e / b.height - 0.5) * 4;
    b = Math.atan(Math.sinh(e) / Math.cos(c));
    var d = Math.PI / 2;
    if (c > d && c <= 3 * d) b += Math.PI;
    c = Math.asin(Math.sin(c) / Math.cosh(e));
    c = Math.floor((0.5 - c / Math.PI) * a.rows);
    b = Math.floor(b / (2 * Math.PI) * a.cols);
    return normal_z(a, c, b)
  }

  function image_icosahedral(a, b, c) {
    var e = a.palette.cmap,
        d;
    for (d = 0; d < b.width; d++) {
      var f;
      for (f = 0; f < b.height; f++) {
        var g = icosahedral_z(a, b, d, f);
        g > 0 && set_pixel(c, d, f, e[g])
      }
    }
  }

  function icosahedral_z(a, b, c, e) {
    var d = Math.floor(c / b.col_w),
        f = Math.floor(e / b.row_h);
    c = Math.floor(c - d * b.col_w);
    var g = Math.floor(e - f * b.row_h);
    g = Math.floor(g * 0.5773502692);
    var h = -1;
    if ((f + d) % 2 == 0) c = Math.floor(b.col_w - c);
    if (f == 0) {
      if (d < 10)
        if (c < g) h = Math.floor(c / g * b.col_w)
    } else if (f == 1)
      if (d == 0) {
        if (c > g) h = c
      } else if (d < 10) h = c;
      else {
        if (d == 10)
          if (c < g) h = c
      } else if (f == 2)
      if (d > 0)
        if (c > g) {
          c = Math.floor(b.col_w - c);
          g = Math.floor(b.col_w - g);
          h = Math.floor(c / g * b.col_w);
          h = Math.floor(b.col_w - h)
        }
    if (h > -1) {
      if ((f + d) % 2 == 0) h = Math.floor(b.col_w -
      h);
      h += Math.floor(d * b.col_w);
      return normal_z(a, e, h)
    } else return 0
  }

  function image_mollweide(a, b, c) {
    var e = a.palette.cmap,
        d;
    for (d = 0; d < b.height; d++) {
      phi_x[d] = Math.sqrt(Math.sin(d / b.height * Math.PI));
      edge_c[d] = Math.floor(b.wd2 * phi_x[d]);
      var f = (0.5 - d / b.height) * 2.8284271247;
      f = Math.asin(f / Math.sqrt(2));
      f = Math.asin((2 * f + Math.sin(2 * f)) / Math.PI);
      xlate_r[d] = Math.floor((0.5 - f / Math.PI) * a.rows)
    }
    for (f = 0; f < b.width; f++)
      for (d = 0; d < b.height; d++) {
        var g = mollweide_z(a, b, f, d);
        g > 0 && set_pixel(c, f, d, e[g])
      }
  }

  function mollweide_z(a, b, c, e) {
    if (c > b.wd2 - edge_c[e] && c < b.wd2 + edge_c[e]) {
      b = Math.floor((c - b.wd2) / phi_x[e]) + a.cd2;
      return normal_z(a, xlate_r[e], b)
    } else return 0
  }

  function image_sinusoidal(a, b, c) {
    var e = a.palette.cmap,
        d;
    for (d = 0; d < b.height; d++) {
      phi_x[d] = Math.sin(d / b.height * Math.PI);
      edge_c[d] = Math.floor(b.wd2 * phi_x[d])
    }
    var f;
    for (f = 0; f < b.width; f++)
      for (d = 0; d < b.height; d++) {
        var g = sinusoidal_z(a, b, f, d);
        g > 0 && set_pixel(c, f, d, e[g])
      }
  }

  function sinusoidal_z(a, b, c, e) {
    if (c > b.wd2 - edge_c[e] && c < b.wd2 + edge_c[e]) {
      b = Math.floor((c - b.wd2) / phi_x[e]) + a.cd2;
      return normal_z(a, e, b)
    } else return 0
  }

  function normal_z(a, b, c) {
    c -= a.rpx;
    if (b < 0) b = 0;
    if (b >= a.rows) b = a.rl1;
    for (; c < 0;) c += a.cols;
    if (c >= a.cols) c %= a.cols;
    return a.map[b][c]
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// canvas.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/
  var rgb_cache = {},
      cache_pix = false,
      pixel_cache = {};

  function fmt_color(a, b, c) {
    var d = "#" + i2h(a) + i2h(b) + i2h(c);
    rgb_cache[d] = [a, b, c, 255];
    return d
  }

  function i2h(a) {
    a = a.toString(16);
    return a.length > 1 ? a : "0" + a
  }

  function color_rgb(a) {
    var b;
    if (rgb_cache[a]) return rgb_cache[a];
    else if (b = parse_color(a)) return rgb_cache[a] = b;
    return [0, 0, 0, 255]
  }

  function parse_color(a) {
    if (match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(a)) return [h2i(match[1]), h2i(match[2]), h2i(match[3]), 255];
    else if (match = /^#([0-9a-f])([0-9a-f])([0-9a-f])/i.exec(a)) return [h2i(match[1]), h2i(match[2]), h2i(match[3]), 255];
    else if (match = /^rgb[(](\d+),(\d+),(\d+)[)]/i.exec(a)) return [d2i(match[1]), d2i(match[2]), d2i(match[3]), 255];
    return false
  }

  function d2i(a) {
    return parseInt(a, 10)
  }

  function h2i(a) {
    return parseInt(a, 16)
  }

  function set_pixel(a, b, c, d) {
    if (cache_pix)
      if (pixel_cache[d]) pixel_cache[d].push([b, c]);
      else pixel_cache[d] = [
        [b, c]
      ];
    else fill_rect(a, b, c, b, c, d)
  }

  function cache_pixels(a) {
    cache_pix = a
  }

  function dump_pixels(a) {
    var b = a.canvas.width,
        c = a.canvas.height,
        d = a.getImageData(0, 0, b, c);
    _.each(pixel_cache, function(value, e) {
      var f = color_rgb(e);
      _.each(pixel_cache[e], function(h) {
        h = h[1] * b + h[0] << 2;
        var g;
        for (g = 0; g < 4; g++) d.data[h + g] = f[g]
      });
    });
    a.putImageData(d, 0, 0);
    cache_pix = false;
    pixel_cache = {}
  }

  function fill_rect(a, b, c, d, e, f) {
    a.fillStyle = f;
    a.fillRect(b, c, d - b + 1, e - c + 1)
  }

  var worldGen={};
  worldGen.generateWorldCanvas = function(targetCanvas, temp, gravity, metal, size){
    var water, ice, rotate, height, projection, palette;
    if(temp < 32) ice = Math.abs(temp-32);
    if(temp > 100) palette = 'barren';
    if(temp > 160){ palette = 'chthonian'; water = temp - 140;}
    if(temp < 100 && temp > 32) { palette = 'atlas'; water = temp - 32 }
    if(gravity > 2 && temp < 160) { metal > 1000 ? palette = 'martian': palette = 'chthonian'; }
    if(gravity < 0.7) { metal > 1000 ? palette = 'barren': palette = 'chthonian'; }

    worldGen.targetCanvas = targetCanvas;

    new_world(water, ice, size || 100, 0, 'mercator', palette)
  };

  return worldGen;
});