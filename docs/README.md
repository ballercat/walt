Documentation site for [walt](https://github.com/ballercat/walt).

## DEVELOPMENT

```
npm install    # install dev-tools
npm start      # run local dev-server
npm run deploy # deploy on github-pages
```

* Markdown content goes in [src/pages/docs](./src/pages/docs).
* Dynamic pages go in [src/pages](./src/pages/).

## TODO

- [X] convert specfic style-stuff (classes, etc) to generic tag-styles under page classes so content can all be plain markdown
- [X] convert image animations to self-contained SVG or custom markdown tags, so they can be inserted into markdown content more simply/easily.
- [ ] generate API docs from code
- [ ] inline explorer (I got a bunch of errors about missing walt stuff)
- [ ] explorer doesn't currently build due to [#160](https://github.com/ballercat/walt/pull/160)
- [ ] styling needs a little more. @matteocargnelutti's scss is a bit more responsive and has a few features the simplificatiopn process missed

## CREDITS

All the style/animations/etc were done by @matteocargnelutti, @konsumer wrapped it up as a gatsby site, simplified styling, and integrated it to gatsby.