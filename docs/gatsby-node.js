const path = require('path');

const GET_MARKDOWN = `
{
  allMarkdownRemark{
    edges {
      node {
        frontmatter {
          path
        }
      }
    }
  }
}
`;

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  return graphql(GET_MARKDOWN).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      if (
        node &&
        node.frontmatter &&
        node.frontmatter.path &&
        node.frontmatter.path !== '/'
      ) {
        createPage({
          path: node.frontmatter.path,
          component: path.resolve('src/components/doc-template.js'),
          context: {},
        });
      }
    });
  });
};

// exports.onCreateWebpackConfig = ({
//   stage,
//   rules,
//   loaders,
//   plugins,
//   actions
// }) => {
//   actions.setWebpackConfig({
//     module: {
//       rules: [
//         {
//           test: /\.(jpe?g|png|svg)(\?.*)?$/i,
//           loader: stage !== 'develop'
//             ? 'file-loader?name=[name]-[hash].[ext]'
//             : 'file-loader'
//         },
//         {
//           test: /\.walt$/,
//           loader: 'raw-loader'
//         }
//       ]
//     },
//     plugins: [
//       plugins.define({
//         __DEVELOPMENT__: stage === `develop` || stage === `develop-html`
//       })
//     ],
//     resolve: {
//       extensions: ['.js', '.jsx', '.json', '.scss', '.css', '.walt']
//     }
//   })
// }
