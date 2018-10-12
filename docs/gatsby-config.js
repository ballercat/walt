module.exports = {
  // hack to make gatsby work on GHP
  pathPrefix: '/walt-docs',

  siteMetadata: {
    title: 'Walt',
    subtitle: 'JavaScript-like syntax for WebAssembly',
    description: 'Walt is an alternative syntax for the WebAssembly text format.',
    image: 'src/assets/img/favicon.png',
    github: 'https://github.com/ballercat/walt'
  },

  plugins: [
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Walt',
        short_name: 'walt',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/images/favicon.png'
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/pages/docs`,
        name: 'markdown-docs'
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          'gatsby-remark-component',
          'gatsby-remark-prismjs'
        ]
      }
    },
    'gatsby-transformer-documentationjs',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'source',
        path: `${__dirname}/../packages/walt-compiler/src/`
      }
    },
    'gatsby-plugin-sass',
    'gatsby-plugin-react-helmet'
  ]
}
