//var rgbToHSLCode = fMath.parse(
//    'R = R/255;' +
//    'G = G/255;' +
//    'B = B/255;' +
//    'cMax = max(R, G, B);' +
//    'cMin = min(R, G, B);' +
//    'deltaC = cMax - cMin;' +
//    'H = (deltaC == 0) ? 0' +
//    '  : (cMax   == r) ? 60 * (((G - B)/deltaC) % 6)' +
//    '  : (cMax   == g) ? 60 * (((B - R)/deltaC) + 2)' +
//    '  : (cMax   == b) ? 60 * (((R - G)/deltaC) + 4)' +
//    '  : 0;' +
//    'S = (deltaC == 0) ? 0 : deltaC/(1 - abs(2 * L - 1));' +
//    'L = (cMax + cMin)/2').compile();
//
//var hslToRGBCode = fMath.parse(
//    'C = (1 - abs(2 * L - 1)) * S;' +
//    'X = C * (1 - abs((H/60) % 2 - 1));' +
//    'M = L - C/2;' +
//    '  (H >= 0   and H <  60) ? (rgb = [C, X, 0])' +
//    ': (H >= 60  and H < 120) ? (rgb = [X, C, 0])' +
//    ': (H >= 120 and H < 180) ? (rgb = [0, C, X])' +
//    ': (H >= 180 and H < 240) ? (rgb = [0, X, C])' +
//    ': (H >= 240 and H < 300) ? (rgb = [X, 0, C])' +
//    ': (H >= 300 and H < 360) ? (rgb = [C, 0, X])' +
//    ': 0;' +
//    'rgb = rgb + M;' +
//    'R = rgb[1];' +
//    'G = rgb[2];' +
//    'B = rgb[3];').compile();

function frac(n, d) {
    return math.fraction(n, d || 1);
}

function between(x, min, max) {
    return math.largerEq(x, frac(min)) && math.smaller(frac(max));
}

var RGB = function(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
};

RGB.prototype.toHSL = function() {
    var _ = math,
        r = _.divide(this.r, frac(255)),
        g = _.divide(this.g, frac(255)),
        b = _.divide(this.b, frac(255)),
        cMax = _.max(r, g, b),
        cMin = _.min(r, g, b),
        deltaC = _.subtract(cMax, cMin),
        h = _.equal(deltaC, 0) ? frac(0)
            : _.equal(cMax, r) ? _.multiply(frac(60), _.mod(_.divide(_.subtract(g, b), deltaC), frac(6)))
            : _.equal(cMax, g) ? _.multiply(frac(60), _.add(_.divide(_.subtract(b, r), deltaC), frac(2)))
            : _.equal(cMax, b) ? _.multiply(frac(60), _.add(_.divide(_.subtract(r, g), deltaC), frac(4)))
            : frac(0),
        l = _.divide(_.add(cMax, cMin), frac(2)),
        s = _.equal(deltaC, 0) ? frac(0)
            : _.divide(deltaC, _.subtract(frac(1), _.abs(_.subtract(_.multiply(frac(2), l), frac(1)))));

    return new HSL(h, s, l);
};

RGB.prototype.toHex = function() {
    return new Hex(this.b | (this.g << 8) | (this.r << 16));
};

var HSL = function(h, s, l) {
    this.h = h;
    this.s = s;
    this.l = l;
};

HSL.prototype.toRGB = function() {
    var _ = math,
        c = _.multiply(_.subtract(frac(1), _.abs(_.subtract(_.multiply(frac(2), this.l), frac(1)))), this.s),
        x = _.multiply(c, _.subtract(1, _.abs(_.subtract(_.mod(_.divide(this.h, frac(60)), frac(2)), frac(1))))),
        m = _.subtract(this.l, _.divide(c, frac(2))),
        rgb = [frac(0), frac(0), frac(0)];

    if      (between(0  , 60 )) rgb = [c, x, frac(0)];
    else if (between(60 , 120)) rgb = [x, c, frac(0)];
    else if (between(120, 180)) rgb = [frac(0), c, x];
    else if (between(180, 240)) rgb = [frac(0), x, c];
    else if (between(240, 300)) rgb = [x, frac(0), c];
    else if (between(300, 360)) rgb = [c, frac(0), x];

    return new RGB(_.multiply(_.add(rgb[0], m), frac(255)), _.multiply(_.add(rgb[1], m), frac(255)), _.multiply(_.add(rgb[2], m), frac(255)));
};

var Hex = function(value) {
    if (typeof value === 'string') {
        if (value.length !== 0) {
            if (value[0] === '#') {
                value = value.substring(1);
            }

            if (value.length === 3) {
                // expands 'FFF' to 'FFFFFF', for example
                value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
            }

            if (value.length !== 3 || value.length !== 6) {
                this.value = 0;
            }
            else {
                this.value = parseInt(value, 16);
            }
        }
    }
    else {
        this.value = value;
    }
};

Hex.prototype.toRGB = function() {
    return new RGB(this.value >> 16, this.value >> 8 & 0xFF, this.value & 0xFF);
};

function pad0(str, count) {
    if (str.length >= count) {
        return str;
    }
    else {
        var newStr = '';

        for (var i = 0; i < count; i++) {
            newStr += '0';
        }

        return newStr.substring(0, newStr.length - str.length)
    }
}

Hex.prototype.toString = function() {
    var str = '';

    str += pad0((this.value >> 16).toString(16), 2);
    str += pad0((this.value >> 8 & 0xFF).toString(16), 2);
    str += pad0((this.value & 0xFF).toString(16));

    return this.value.toString(16);
};

window.onload = function() {
    checkForChange();
};

var sliders = $('input[type=range]');

function checkForChange() {
    sliders.each(function(i, slider) {
        // if the value has changed since the last update...
        if ($(slider).data('update-value') !== $(slider).val()) {
            $(slider).data('update-value', $(slider).val());
            update($(slider).closest('.input-container').data('type'));
        }
    });

    requestAnimationFrame(checkForChange);
}

var rgb = new RGB();
var hsl = new HSL();
var hex = new Hex();

function update(changedType) {
    var rgbR = $('#rgb-r-input').val(),
        rgbG = $('#rgb-g-input').val(),
        rgbB = $('#rgb-b-input').val(),
        hslH = $('#hsl-h-input').val(),
        hslS = $('#hsl-s-input').val(),
        hslL = $('#hsl-l-input').val(),
        hexV = $('#hex-input').val();

    switch (changedType) {
        case 'rgb':
            rgb.r = frac(rgbR);
            rgb.g = frac(rgbG);
            rgb.b = frac(rgbB);

            hsl = rgb.toHSL();
            hex = rgb.toHex();
            break;
        case 'hsl':
            hsl.h = frac(hslH);
            hsl.s = frac(hslS, 100);
            hsl.l = frac(hslL, 100);

            rgb = hsl.toRGB();
            hex = rgb.toHex();
            break;
        case 'hex':
            hex = new Hex(hexV);

            rgb = hex.toRGB();
            hsl = rgb.toHSL();
            break;
    }

    if (changedType !== 'hex') {
        $('#hex-input').val('#' + hex.toString());
    }

    if (changedType !== 'rgb') {
        $('#rgb-r-input').val(rgb.r.toString());
        $('#rgb-g-input').val(rgb.g.toString());
        $('#rgb-b-input').val(rgb.b.toString());
    }

    if (changedType !== 'hsl') {
        $('#hsl-h-input').val(hsl.h.toString());
        $('#hsl-s-input').val(hsl.s.toString());
        $('#hsl-l-input').val(hsl.l.toString());
    }

    // update all outputs
    $('#rgb-r-output').text(rgb.r.toString());
    $('#rgb-g-output').text(rgb.g.toString());
    $('#rgb-b-output').text(rgb.b.toString());

    $('#hsl-h-output').text(math.format(hsl.h, {precision: 0}));
    $('#hsl-s-output').text(math.format(hsl.s, {precision: 0}));
    $('#hsl-l-output').text(math.format(hsl.l, {precision: 0}));

    // update color preview
    $('.color-preview').css('background-color', 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')');
}

/*
function rand(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toPercent(x)
{
    return Math.round(x * 100) + '%';
}

function updateColor(inputType) {
    var hex = $('#hex-input').val();

    if (hex[0] !== '#') {
        hex = '#' + hex;
    }

    var rgbR = $('#rgb-r-input').val();
    var rgbG = $('#rgb-g-input').val();
    var rgbB = $('#rgb-b-input').val();

    var hslH = $('#hsl-h-input').val();
    var hslS = $('#hsl-s-input').val();
    var hslL = $('#hsl-l-input').val();

    var color;

    switch (inputType) {
        case 'hex':
            color = $.Color(hex);
            break;
        case 'rgb':
            color = $.Color(rgbR, rgbG, rgbB);
            break;
        case 'hsl':
            color = $.Color({hue: hslH, saturation: hslS, lightness: hslL});
            break;
    }

    var hex = color.toHexString(false).toUpperCase();

    var red = color.red();
    var green = color.green();
    var blue = color.blue();

    var hue = color.hue();
    var saturation = color.saturation();
    var saturationPercent = toPercent(saturation);
    var lightness = color.lightness();
    var lightnessPercent = toPercent(lightness);

    // update all inputs
    if (inputType !== 'hex') {
        $('#hex-input').val(hex);
    }

    if (inputType !== 'rgb') {
        $('#rgb-r-input').val(red);
        $('#rgb-g-input').val(green);
        $('#rgb-b-input').val(blue);
    }

    if (inputType !== 'hsl') {
        $('#hsl-h-input').val(hue);
        $('#hsl-s-input').val(saturation);
        $('#hsl-l-input').val(lightness);
    }


    // update all outputs
    $('#rgb-r-output').text(red);
    $('#rgb-g-output').text(green);
    $('#rgb-b-output').text(blue);

    $('#hsl-h-output').text(hue);
    $('#hsl-s-output').text(saturationPercent);
    $('#hsl-l-output').text(lightnessPercent);

    $('#hex-output').text(hex).data('manually-changed', true);

    // update color preview
    $('.color-preview').css('background-color', color.toRgbaString());
}

$(function() {
    // start out with a random color by default for fun
    $('#rgb-r-input').val(rand(0, 255));
    $('#rgb-g-input').val(rand(0, 255));
    $('#rgb-b-input').val(rand(0, 255));

    updateColor('rgb');

    var setBeingUsed = function() {
        $(this).data('being-changed', true);
    };

    $('input[type=range]')
        .data('being-changed', true)
        .on('change', setBeingUsed)
        .on('mousedown', setBeingUsed)
        .on('mouseup', setBeingUsed)
        .each(function(i, input) {
            setInterval(function() {
                var beingChanged = $(input).data('being-changed');

                if (! beingChanged) return;

                var lastValue = $(input).data('last-value');
                var newValue = $(input).val();

                if (lastValue === newValue) return;

                $(input).data('last-value', newValue);

                var inputType = $(input).closest('.input-container').attr('data-type');

                updateColor(inputType);
            }, 8 /!* roughly 120 FPS *!/);
        });

    $('#hex-input').on('keyup', function() {
        var inputType = $(this).closest('.input-container').attr('data-type');

        updateColor(inputType);
    });
});
*/
