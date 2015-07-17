# perfectionist [![Build Status](https://travis-ci.org/ben-eb/perfectionist.svg?branch=master)][ci] [![NPM version](https://badge.fury.io/js/perfectionist.svg)][npm] [![Dependency Status](https://gemnasium.com/ben-eb/perfectionist.svg)][deps]

> Beautify CSS files.

## Install

With [npm](https://npmjs.org/package/perfectionist) do:

```
npm install perfectionist --save
```

## Example

### Input

```css
h1   {
         color   :  red }
```

### Expanded output

```css
h1 {
    color: red;
}
```

### Compact output

```css
h1 { color: red; }
```

### Compressed output

```css
h1{color:red}
```

## API

### perfectionist([options])

#### options

##### style

Type: `string`
Default: `expanded`

Pass either `expanded`, `compact` or `compressed`. Note that the `compressed`
style only facilitates simple whitespace compression around selectors &
declarations. For more powerful compression, see [cssnano].

##### maxSelectorLength

Type: `boolean|number`
Default: `80`

If set to a positive integer, set a maximum width for a selector string; if
it exceeds this, it will be split up over multiple lines. If false, this
behaviour will not be performed. Note that this transform is excluded from the
`compressed` style.

##### sourcemap

Type: `boolean`
Default: `false`

Generate a sourcemap with the transformed CSS.

### `postcss([ perfectionist(opts) ])`

perfectionist can also be consumed as a PostCSS plugin. See the
[documentation](https://github.com/postcss/postcss#usage) for examples for
your environment.

### CLI

perfectionist also ships with a CLI app. To see the available options, just run:

```sh
$ perfectionist --help
```

## Usage

See the [PostCSS documentation](https://github.com/postcss/postcss#usage) for
examples for your environment.

## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests
to cover it.

## License

MIT © [Ben Briggs](http://beneb.info)

[ci]:      https://travis-ci.org/ben-eb/perfectionist
[cssnano]: https://github.com/ben-eb/cssnano
[deps]:    https://gemnasium.com/ben-eb/perfectionist
[npm]:     http://badge.fury.io/js/perfectionist
[postcss]: https://github.com/postcss/postcss
