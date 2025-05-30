require('@koobiq/tokens-builder/build');
const path = require('path');
const StyleDictionary = require('style-dictionary');
const {
    applyCustomTransformations,
    resolvePath,
    additionalFilter,
    resolveComponentName,
    filterTokens,
    dictionaryMapper
} = require('./utils');

const TOKEN_FILE_EXT = 'json5';
const BASE_PATH = 'node_modules/@koobiq/design-tokens/web';
const customHeader = `/* stylelint-disable no-unknown-custom-properties */`;

const manuallyResolvedCategories = ['light', 'dark', 'palette', 'shadow'];

const componentsWithCss = [
    'accordion',
    'alert',
    'autocomplete',
    'badge',
    'button',
    'button-toggle',
    'checkbox',
    'code-block',
    'datepicker',
    'description-list',
    'divider',
    'dropdown',
    'empty-state',
    'file-upload',
    'form-field',
    'hint',
    'icon',
    'icon-button',
    'icon-item',
    'input',
    'link',
    'list',
    'loader-overlay',
    'modal',
    'markdown',
    'navbar',
    'popover',
    'progress-bar',
    'progress-spinner',
    'radio',
    'risk-level',
    'select',
    'sidepanel',
    'scrollbars',
    'forms',
    'option',
    'splitter',
    'tag',
    'tabs',
    'tag',
    'tabs',
    'table',
    'textarea',
    'timezone',
    'toast',
    'toggle',
    'tooltip',
    'tree',
    'tree-select'
];

const args = (process.argv.slice(2).length && process.argv.slice(2)) || componentsWithCss;

const styleDictionaryConfig = {
    source: [`${BASE_PATH}/properties/**/*.json5`, `${BASE_PATH}/components/**/*.json5`],
    platforms: {
        css: {
            buildPath: `packages/components/`,
            transformGroup: 'kbq/css',
            filter: (token) => !['font', 'size', 'typography', 'md-typography'].includes(token.attributes.category)
        }
    }
};

StyleDictionary.registerFormat({
    name: 'kbq-css/component',
    formatter: function ({ dictionary, options = {} }) {
        const {
            outputReferences,
            component,
            lightThemeSelector = ':where(.kbq-light, .theme-light, .kbq-theme-light)',
            darkThemeSelector = ':where(.kbq-dark, .theme-dark, .kbq-theme-dark)'
        } = options;

        const allTokens = applyCustomTransformations(dictionary);

        dictionary.allTokens.forEach((token) => {
            token.name = token.name.replace(/(light|dark)-/, '');
        });
        dictionary.allTokens = dictionary.allProperties = allTokens.filter(
            (token) =>
                !manuallyResolvedCategories.includes(token.attributes.category) || additionalFilter(token, component)
        );

        // formatting function expects dictionary as input, so here initialize a copy to work with different tokens
        const baseDictionary = filterTokens(
            dictionary,
            (token) =>
                [token.attributes.type, token.attributes.category, token.attributes.item].some(
                    (attr) => attr === 'size'
                ) ||
                token.attributes.font ||
                token.attributes.category === 'typography'
        );
        const lightDictionary = filterTokens(dictionary, (token) => token.attributes.light);
        const darkDictionary = filterTokens(dictionary, (token) => token.attributes.dark);

        return (
            `${customHeader}\n\n` +
            Object.entries({
                [`.kbq-${resolveComponentName(component)}`]: baseDictionary,
                [lightThemeSelector]: lightDictionary,
                [darkThemeSelector]: darkDictionary
            })
                .filter(([, currentDictionary]) => currentDictionary.allTokens.length)
                .map(([key, currentDictionary]) => {
                    return `${key} {\n` + dictionaryMapper(currentDictionary, outputReferences) + `\n}\n`;
                })
                .join('\n')
        );
    }
});

function fileFormat(destination, component) {
    return {
        destination,
        filter: (token) =>
            token.attributes.category === component ||
            // give access to these tokens to resolve reference manually
            manuallyResolvedCategories.includes(token.attributes.category) ||
            additionalFilter(token, component),
        format: 'kbq-css/component',
        prefix: 'kbq',
        options: {
            component,
            outputReferences: true
        }
    };
}

const main = async () => {
    const files = args.map((component) => `${component}.${TOKEN_FILE_EXT}`);

    styleDictionaryConfig.platforms.css.files = files
        .filter((file) => path.extname(file).includes(TOKEN_FILE_EXT))
        .flatMap((currentValue) => {
            const component = path.basename(currentValue, `.${TOKEN_FILE_EXT}`);
            const destination = resolvePath(component);

            if (Array.isArray(destination)) {
                return destination.map(({ path, aliasName }) => fileFormat(path, aliasName));
            }

            return fileFormat(destination, component);
        });

    StyleDictionary.extend(styleDictionaryConfig).buildPlatform('css');
};

main();
