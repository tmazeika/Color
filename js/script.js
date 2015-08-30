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
            }, 8 /* roughly 120 FPS */);
        });

    $('#hex-input').on('keyup', function() {
        var inputType = $(this).closest('.input-container').attr('data-type');

        updateColor(inputType);
    });
});
