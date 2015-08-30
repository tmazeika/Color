var ColorFormats = {
    HEX: "hex",
    RGBA: "rgba",
    HSLA: "hsla"
};

var currentColorFormat = ColorFormats.RGBA;
var previousInputs;
var previousColor;
var currentColor;

function trackInput(e)
{
    var lastVal;

    setInterval(function() {
        var thisVal = $(e).val();

        if ( ! lastVal || lastVal !== thisVal) updateColor();

        lastVal = thisVal;
    }, 10)
}

function rand(min, max)
{
    return Math.floor( Math.random() * (max - min + 1) ) + min;
}

function toPercent(x)
{
    return Math.round( x * 100 ) + "%";
}

// read the inputted color info and update
function updateColor()
{
    // read the correct color input type (rgba, hsla, or hex)
    switch (currentColorFormat)
    {
        case ColorFormats.HEX:
            var hex = $("#hex-input").val();
            var hexA = 1;

            if (hex.charAt(0) !== "#")
            {
                hex = "#" + hex;
            }

            // if we have information about the alpha, use it
            if (hex.length === 8 || hex.length === 9)
            {
                // get the last 1 or 2 characters to get the alpha info
                var lastSubStr = hex.substr( hex.length - (hex.length === 8 ? 1 : 2) );

                // convert the hex alpha info to decimal then get the percentage (for jQuery Color)
                hexA = parseInt(lastSubStr, 16) / 255;
            }

            currentColor = $.Color(hex);
            currentColor = currentColor.alpha(hexA);

            break;

        case ColorFormats.RGBA:
            var rgbaR = $("#rgba-r-input").val();
            var rgbaG = $("#rgba-g-input").val();
            var rgbaB = $("#rgba-b-input").val();
            var rgbaA = $("#rgba-a-input").val();

            currentColor = $.Color(rgbaR, rgbaG, rgbaB, rgbaA);
            break;

        case ColorFormats.HSLA:
            var hslaH = $("#hsla-h-input").val();
            var hslaS = $("#hsla-s-input").val();
            var hslaL = $("#hsla-l-input").val();
            var hslaA = $("#hsla-a-input").val();

            currentColor = $.Color({ hue: hslaH, saturation: hslaS, lightness: hslaL });
            currentColor = currentColor.alpha(hslaA);
            break;
    }

    previousColor = currentColor;

    var alpha = currentColor.alpha();
    var alphaPercent = toPercent(alpha);

    var hex = currentColor.toHexString(alpha !== 1).toUpperCase();

    var red = currentColor.red();
    var green = currentColor.green();
    var blue = currentColor.blue();

    var hue = currentColor.hue();
    var saturation = currentColor.saturation();
    var saturationPercent = toPercent(saturation);
    var lightness = currentColor.lightness();
    var lightnessPercent = toPercent(lightness);

    // update all inputs
    if (currentColorFormat !== ColorFormats.HEX)
    {
        $("#hex-input").val(hex);
    }

    if (currentColorFormat !== ColorFormats.RGBA)
    {
        $("#rgba-r-input").val(red);
        $("#rgba-g-input").val(green);
        $("#rgba-b-input").val(blue);
        $("#rgba-a-input").val(alpha);
    }

    if (currentColorFormat !== ColorFormats.HSLA)
    {
        $("#hsla-h-input").val(hue);
        $("#hsla-s-input").val(saturation);
        $("#hsla-l-input").val(lightness);
        $("#hsla-a-input").val(alpha);
    }

    // update all results
    $(".color-preview").css("background-color", currentColor.toRgbaString());

    $("#hex-output").text(hex);

    $("#rgba-r-output").text(red);
    $("#rgba-g-output").text(green);
    $("#rgba-b-output").text(blue);
    $("#rgba-a-output").text(alphaPercent);

    $("#hsla-h-output").text(hue);
    $("#hsla-s-output").text(saturationPercent);
    $("#hsla-l-output").text(lightnessPercent);
    $("#hsla-a-output").text(alphaPercent);
}

$(function() {
    // start out with a random color by default for fun
    $("#rgba-r-input").val( rand(0, 255) );
    $("#rgba-g-input").val( rand(0, 255) );
    $("#rgba-b-input").val( rand(0, 255) );

    // initialize color
    updateColor();

    // lock the color control container dimensions
    var colorControlContainer = $(".color-control-container");
    colorControlContainer.css('width', colorControlContainer.css('width') );
    colorControlContainer.css('height', colorControlContainer.css('height') );

    // track input changes
    $.each($("input"), function(i, val)
    {
        trackInput(val);
    });

    // show the correct controls when a color button is clicked
    $(".color-format-button").click(function()
    {
        currentColorFormat = $(this).data("type");

        // remove all active buttons then add the class to the clicked button
        $(".color-format-button").removeClass("active");
        $(this).addClass("active");

        // hide all inputs then show the one we need
        $(".color-inputs").hide();
        $(".color-inputs[data-type='" + currentColorFormat + "']").show();
    });
});
