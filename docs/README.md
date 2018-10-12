Documentation site for [walt](https://github.com/ballercat/walt).

Currently running [here](http://konsumer.js.org/walt/).


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
- [ ] explorer (issues building, due to [#160](https://github.com/ballercat/walt/pull/160)) this should be a standalone reusable react component
- [ ] styling needs a little more. @matteocargnelutti's scss is a bit more responsive and has a few features the simplificatiopn process missed
- [ ] `/docs` should probly be hand-edited, so we can put stuff in the proper order and add nice intro.
- [ ] `/api` is just a demo page that shows how to query. it should be more fleshed out.

## CREDITS

All the style/animations/etc were done by @matteocargnelutti, @konsumer wrapped it up as a gatsby site, simplified styling, and integrated it to gatsby.