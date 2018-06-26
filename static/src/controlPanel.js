"use strict";

//set up sliders
const setSlider = (sliderID,startValues,rangeValues) => {
    noUiSlider.create(sliderID, {
    start: startValues,
    range: {
        'min': [  rangeValues[0] ],
        'max': [ rangeValues[1] ]
    },
    connect: true
    })
    return noUiSlider
}

//switch off options for core periphery if the option is not selected
const disableCorePeripheryOptions = () => {
    let value = document.getElementById("nodeCoord").value
    if (value == 'core-periphery') {
        $('#coreCategory').prop('disabled', false);
        $('#innerOuterRadius').prop('disabled', false);
        $('#innerCircleRadius').prop('disabled', false);
        $('#outerCirclesRadius').prop('disabled', false);
    }
    else if (value == 'grouped') {
        $('#coreCategory').prop('disabled', true);
        $('#innerOuterRadius').prop('disabled', false);
        $('#innerCircleRadius').prop('disabled', true);
        $('#outerCirclesRadius').prop('disabled', false);
    }
    else if (value == 'default') {
        $('#coreCategory').prop('disabled', true);
        $('#innerOuterRadius').prop('disabled', true);
        $('#innerCirclesRadius').prop('disabled', false);
        $('#outerCirclesRadius').prop('disabled', true);
    }
}

//set slider for edge cut off
const setEdgeRankSlider = (sliderID,startValue) => {
    noUiSlider.create(sliderID, {
    start: startValue,
    range: {
        min: [0],
        max: [1]
    }
    })
    return noUiSlider
}

if (typeof window === 'undefined') {
    var noUiSlider = require('../node_modules/noUiSlider')
    exports.setSlider = setSlider
    exports.disableCorePeripheryOptions = disableCorePeripheryOptions
    exports.setEdgeRankSlider = setEdgeRankSlider
    }