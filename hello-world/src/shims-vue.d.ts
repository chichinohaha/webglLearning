/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module '*.fs' 
declare module 'raw-loader!*/**/*.vs'{}
declare module 'raw-loader!*'