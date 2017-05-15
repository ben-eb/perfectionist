# Rationale

Perfectionist is an opinionated CSS formatter. This document gives the rationale behind these opinions. Much of this has been adopted directly from the [Prettier](https://github.com/prettier/prettier) JavaScript formatter, and adapted where relevant to meet the needs of CSS.

## What Perfectionist is concerned with

### Consistency

Perfectionist exists for one purpose: to enforce consistency across your entire project. Not only do we output code with consistent whitespace, Perfectionist will lay out code according to a wrapping algorithm based on a maximum line width. That means that long expressions will be broken up across lines, removing the need for manual layout from the programmer which inevitably leads to inconsistency.

### Correctness

Perfectionist will output code that has the exact same behavior as before formatting. Please report any CSS code where Perfectionist fails to follow this correctness rule — that's a bug which needs to be fixed!

### Whitespace

### Empty lines

## What Perfectionist is not concerned with

Perfectionist will *not* change the meaning of the code. It will not attempt to "fix" any CSS that is broken or might exhibit unwanted behavior. (Spotting that sort of thing is a job for a linter, such as [stylelint](https://github.com/stylelint/stylelint)). Here are a few examples of things that are out of scope of Perfectionist:

- Changing `:before` pseudo-element selectors to `::before` or vice-versa (these can exhibit differing behavior in IE8)
- …?

## Sass and other CSS syntax variants

We will try to be forgiving where possible with syntax, as there are such a wide variety of flavors of CSS available, especially since the advent of PostCSS and the custom plugins that come with it. However, we cannot account for every obscure tool.

Our officially supported syntaxes include "vanilla" CSS and Sass. This means Perfectionist will not crash if given nested rules, mixins, and Sass variables.

## Undecided issues

The following things may or may not be in-scope for Perfectionist:

- Capitalization. This includes the following; we may decide some of these are in scope while others are out of scope:
  - keywords (`auto` vs `AUTO`)
  - hex colors (`#ffffff` vs `#FFFFFF`)
  - tags/attributes in selectors (`div` vs `DIV`; class names, of course, are case sensitive, and cannot be modified)
- Hex code length: should we abbreviate/expand `#fff` vs `#ffffff` when possible?
- Multiple consecutive empty lines: portions of a stylesheet are often grouped using empty lines (see https://csswizardry.com/2017/05/writing-tidy-code/). Consolidating these down to one line can remove this implied meaning to the reader. However, these spacings are often inconsistent, and an argument could be made for reducing multiple empty lines down to just one (or maybe two) empty lines for consistent styling.
