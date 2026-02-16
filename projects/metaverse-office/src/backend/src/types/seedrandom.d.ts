/**
 * 模拟系统类型声明
 */

declare module 'seedrandom' {
  export type PRNG = () => number
  
  function seedrandom(seed: string, options?: any): PRNG
  
  export default seedrandom
}
