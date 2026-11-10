// Local rules Oxlint has no built-in equivalent for.
export default {
  meta: { name: 'local' },
  rules: {
    'css-module-import-name': {
      meta: {
        messages: {
          name: 'Import CSS modules as `import STYLES from "./name.module.css"`.',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            if (!node.source.value.endsWith('.module.css')) {
              return;
            }

            for (const specifier of node.specifiers) {
              const isStyles =
                specifier.type === 'ImportDefaultSpecifier' &&
                specifier.local.name === 'STYLES';

              if (!isStyles) {
                context.report({ node: specifier, messageId: 'name' });
              }
            }
          },
        };
      },
    },
  },
};
