// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
rules: {
  "vue/multi-word-component-names": "off",
  "import/first": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "vue/no-side-effects-in-computed-properties": "off"
}
)
