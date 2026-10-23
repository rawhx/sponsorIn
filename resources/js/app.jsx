import '@fontsource-variable/plus-jakarta-sans';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { MotionConfig } from 'motion/react';
import { createRoot } from 'react-dom/client';

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
    const page = pages[`./pages/${name}.jsx`];

    if (!page) {
      throw new Error(`Halaman tidak ditemukan: ${name}`);
    }

    return page;
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <MotionConfig reducedMotion="user">
        <App {...props} />
      </MotionConfig>
    );
  },
});
