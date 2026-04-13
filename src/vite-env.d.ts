/// <reference types="vite/client" />

declare module "*.{css,scss,less,sass}" {
  const content: { [className: string]: string };
  export default content;
}

