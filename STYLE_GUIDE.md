# Vue Component Style Guide

This document outlines the coding style and structure for Vue components in this project. Adhering to these guidelines will help maintain a consistent and readable codebase.

## 1. File Structure (Single-File Components)

All Vue components should be single-file components (`.vue`) and follow a specific block order to ensure consistency.

**Order of Blocks:**

1.  `<script setup lang="ts">`
2.  `<template>`
3.  `<style scoped lang="scss">`
4.  `<i18n lang="yaml">`

**Example:**

```vue
<script setup lang="ts">
  // --- JSDoc File Description ---
  /**
   * @file ComponentName.vue
   * @description A brief description of the component's purpose and functionality.
   */

  // --- 1. Core Vue Imports ---
  import { ref, computed, onMounted } from 'vue';

  // --- 2. Third-Party Library Imports ---
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';

  // --- 3. Pinia Store Imports ---
  import { useMyStore } from 'stores/myStore';

  // --- 4. Local Component/Composable/Util Imports ---
  import MyChildComponent from './MyChildComponent.vue';
  import { useMyComposable } from 'src/composables/useMyComposable';
  import { myUtilFunction } from 'src/utils/MyUtils';

  // --- Store and Library Instantiation ---
  const myStore = useMyStore();
  const { t } = useI18n();

  // --- Component Logic (props, emits, refs, etc.) ---
</script>

<template>
  <!-- Component template here -->
</template>

<style scoped lang="scss">
  /* Component-specific styles here */
</style>

<i18n lang="yaml">
ko:
  # Korean translations
en:
  # English translations
</i18n>
```

### Script Block (`<script setup lang="ts">`)

-   **`lang="ts"` is mandatory.** All script logic should be written in TypeScript.
-   **`setup` attribute is mandatory.** Use the Composition API with `<script setup>`.
-   **JSDoc Header:** Every component file must start with a JSDoc block describing its purpose (`@file`, `@description`).
-   **Import Order:** Imports should be grouped and ordered as follows:
    1.  Vue core and composition API functions (`vue`).
    2.  Third-party libraries (e.g., `quasar`, `vue-i18n`).
    3.  Pinia stores (`stores/...`).
    4.  Local modules (components, composables, utils).
-   **Variable Declarations:**
    -   Instantiate stores and libraries (`useMyStore()`, `useI18n()`) immediately after imports.
    -   Group related reactive variables (`ref`, `reactive`, `computed`).

## 2. Component API

-   **Props:** Use `withDefaults` and `defineProps` for clear, typed props with default values.
-   **Emits:** Use `defineEmits` to declare events the component can emit.
-   **Accessibility:**
    -   Use ARIA attributes (`role`, `aria-label`, etc.) to make components accessible.
    -   Use the `t()` function from `vue-i18n` to provide accessible labels.

## 3. State Management (Pinia)

-   **Centralized State:** All shared application state should be managed in Pinia stores (located in `src/stores`).
-   **Store Access:** Import and instantiate stores at the top of the `<script setup>` block.
-   **Directives and Actions:** Use store state and actions directly in the component logic. Avoid duplicating state locally.

## 4. Internationalization (i18n)

-   **`<i18n>` Block:** Use the `<i18n>` block with `lang="yaml"` for component-specific translations. For shared translations, you can use `src="../i18n/components/your-component.yml"`.
-   **`useI18n`:** Instantiate the `t` function from `useI18n` for use in the `<script>` and `<template>` blocks.
-   **Keys:** Use descriptive, camelCase keys for translation strings.

## 5. Styling (Quasar and SCSS)

-   **Quasar Components:** Leverage Quasar's component library for UI elements. Use Quasar's utility classes for layout and spacing (e.g., `row`, `q-pa-sm`).
-   **Scoped Styles:** The `<style>` block **must** be `scoped` to prevent styles from leaking globally.
-   **`lang="scss"` is mandatory.** Use SCSS for styling.
-   **Dynamic Styles:** Use `v-bind()` in CSS to bind component state to styles for dynamic theming.

## 6. Naming Conventions

-   **Components:** PascalCase (e.g., `MyComponent.vue`).
-   **Variables and Functions:** camelCase (e.g., `myVariable`, `myFunction`).
-   **Props and Emits:** camelCase.

## 7. Code Comments

-   **File-Level:** Use a JSDoc block at the top of the file to describe the component's purpose.
-   **Function-Level:** Add JSDoc comments to complex functions, explaining their purpose, parameters (`@param`), and return values (`@returns`).
-   **In-line Comments:** Use comments to explain complex or non-obvious logic.
