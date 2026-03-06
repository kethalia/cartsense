import nextConfig from "eslint-config-next"
import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

const eslintConfig = [
  ...nextConfig,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Hydration guards (useEffect(() => setMounted(true), [])) are a standard pattern
      "react-hooks/set-state-in-effect": "warn",
      // Math.random in useMemo for skeleton widths is intentional
      "react-hooks/purity": "warn",
      // React Hook Form watch() is widely used
      "react-hooks/incompatible-library": "warn",
    },
  },
]

export default eslintConfig
