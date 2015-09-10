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

### perfectionist.process(css, [options])

#### css

Type: `string`
*Required option.*

Pass a CSS string to beautify it.

#### options

##### cascade

Type: `boolean`
Default: `true`

Set this to `false` to disable visual cascading of vendor prefixed properties.
Note that this transform only applies to the `expanded` format.

###### `true`

```css
h1 {
    -webkit-border-radius: 12px;
            border-radius: 12px;
}
```

###### `false`

```css
h1 {
    -webkit-border-radius: 12px;
    border-radius: 12px;
}
```

##### format

Type: `string`
Default: `expanded`

Pass either `expanded`, `compact` or `compressed`. Note that the `compressed`
format only facilitates simple whitespace compression around selectors &
declarations. For more powerful compression, see [cssnano].

##### indentSize

Type: `number`
Default: `4`

This number will be used as a basis for all indent levels, using the `expanded`
format.

##### maxAtRuleLength

Type: `boolean|number`
Default: `80`

If set to a positive integer, set a maximum width for at-rule parameters; if
they exceed this, they will be split up over multiple lines. If false, this
behaviour will not be performed. Note that this transform only applies to
the `expanded` format.

##### maxSelectorLength

Type: `boolean|number`
Default: `80`

If set to a positive integer, set a maximum width for a selector string; if
it exceeds this, it will be split up over multiple lines. If false, this
behaviour will not be performed. Note that this transform is excluded from the
`compressed` format.

##### maxValueLength

Type: `boolean|number`
Default: `80`

If set to a positive integer, set a maximum width for a property value; if
it exceeds this, it will be split up over multiple lines. If false, this
behaviour will not be performed. Note that this transform only applies to
the `expanded` format.

##### sourcemap

Type: `boolean`
Default: `false`

Generate a sourcemap with the transformed CSS.

##### syntax

Type: `string`

Specify `scss` if you would like to also format SCSS-style single line comments.
This loads the [postcss-scss](https://github.com/postcss/postcss-scss) plugin.

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

## Integrations

- [Sublime Text plugin](https://github.com/yisibl/sublime-perfectionist)
- [Atom plugin](https://github.com/sindresorhus/atom-perfectionist)

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
