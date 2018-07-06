# fluent-arguments

*When simple arguments just don't cut it.*

[![npm](https://img.shields.io/npm/v/fluent-arguments.svg?maxAge=3600)](https://www.npmjs.com/package/fluent-arguments)
[![Travis branch](https://img.shields.io/travis/lukastaegert/fluent-arguments/master.svg?maxAge=3600)](https://travis-ci.org/lukastaegert/fluent-arguments)
[![codecov.io](https://img.shields.io/codecov/c/github/lukastaegert/fluent-arguments.svg?maxAge=3600)](http://codecov.io/github/lukastaegert/fluent-arguments)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?maxAge=3600)](http://standardjs.com/)
[![npm](https://img.shields.io/npm/dm/fluent-arguments.svg?maxAge=3600)](https://www.npmjs.com/package/fluent-arguments)
[![David](https://img.shields.io/david/lukastaegert/fluent-arguments.svg?maxAge=3600)](https://david-dm.org/lukastaegert/fluent-arguments)
[![Greenkeeper badge](https://badges.greenkeeper.io/lukastaegert/fluent-arguments.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?maxAge=3600)](https://github.com/semantic-release/semantic-release)

## The problem
Let's assume you wrote a nice library `my-rainbow` for creating rainbow-like patterns. To create a pattern with a
specific order of colors, you could have implemented something like this:
```javascript
var createRainbow = require('my-rainbow').createRainbow
var specialRainbow = createRainbow('red', 'green', 'yellow', 'blue')
```

Now for the next version, you want colors to be able to have a special "sparkling" effect. How could you implement
this API change while maintaining backward compatibility?

1. Double the number of color constants:
   ```javascript
   var specialRainbow = createRainbow('red', 'sparkling-green', 'yellow', 'blue')
   ```
   …probably does not scale very well (gradients anyone?).

2. Allow for special objects to be used as arguments alongside strings:
   ```javascript
   var specialRainbow = createRainbow('red', {color: 'green', sparkling: true}, 'yellow', 'blue')
   ```
   scales much better, but readability starts to suffer. And it is not obvious which would be valid options.

## Fluent arguments
`fluent-arguments` makes it trivial to implement the following API:
```javascript
var sparkling = require('my-rainbow').sparkling
var specialRainbow = createRainbow('red', sparkling('green'), 'yellow', 'blue')
```
which is arguably as easily readable as approach 1 while being about as maintainable and modular as approach 2.

Fluent arguments can also be configured to describe previous arguments. To that end, let us assume you also want to
specify that some colored areas occasionally flash in other colors:
```javascript
var withFlashesIn = require('my-rainbow').withFlashesIn
var specialRainbow = createRainbow('red', 'green', withFlashesIn('white'), 'yellow', 'blue')
```

Nice, isn't it? A word of caution: Especially when using the second type of arguments, you should make sure from the
wording of your fluent argument that it actually further describes the previous argument :) To avoid confusion, it is
helpful to only stick to one type of arguments. So if you want to have sparkling AND flashing colors, `fluent-arguments`
allows you to specify your API like this:
```javascript
var withSparkles = require('my-rainbow').withSparkles
var specialRainbow = createRainbow('red', 'green', withSparkles, withFlashesIn('white'), 'yellow', 'blue')
```

## How to build such an API
`fluent-arguments` provides two exports, `createArg` and `createFunc`. With `createFunc`, you create a function that
receives a variable number of arguments, each of which can be fluent arguments:
```javascript
var fa = require('fluent-arguments')

function createRainbowHandler(args) {
  // some implementation
}

var createRainbow = fa.createFunc(createRainbowHandler)
var specialRainbow = createRainbow('red', 'green', 'yellow', 'blue')
// calls createRainbowHandler([{value: 'red'}, {value: 'green'}, {value: 'yellow'}, {value: 'blue'}])
```

As you can see, normal arguments become argument objects with the original value stored as `value`. Now, `createArg`
allows you to create special fluent arguments which are parsed differently by `createRainbow`:
```javascript
var sparkling     = fa.createArg({args: ['value'], extra: {sparkling: true}})
var withFlashesIn = fa.createArg({args: ['withFlashesIn'], extendsPrevious: true})
var withSparkles  = fa.createArg({extra: {sparkling: true}, extendsPrevious: true})
```

`createArg` receives an object which can have any of the following fields, all of which are optional:
* `args: ['argument1' <,'argument2'…>]`  
    If `args` is specified, the fluent argument will be a function; when invoked, the function arguments will be
    mapped to the provided keys of the argument object, e.g. the first argument will be mapped to `'argument1'` etc.;
    if `args` is not specified, the fluent argument will be a plain object.
* `extendsPrevious: <false|true>`  
    If this is set to true, this argument will not create a new argument object but extend the previous object
* `extra: {some: object}`  
    If this option is specified, the given object will be merged into the current (or previous) argument object.
 
This has the following effect:
```javascript
var specialRainbow = createRainbow('red', sparkling('green'), 'yellow', 'blue')
// calls createRainbowHandler([{value: 'red'}, {value: 'green', sparkling: true}, {value: 'yellow'}, {value: 'blue'}])
specialRainbow = createRainbow('red', 'green', withFlashesIn('white'), 'yellow', 'blue')
// calls createRainbowHandler([{value: 'red'}, {value: 'green', withFlashesIn: 'white'}, {value: 'yellow'}, {value: 'blue'}])
specialRainbow = createRainbow('red', 'green', withSparkles, withFlashesIn('white'), 'yellow', 'blue')
// calls createRainbowHandler([{value: 'red'}, {value: 'green', withFlashesIn: 'white', sparkling: true}, {value: 'yellow'}, {value: 'blue'}])
```
