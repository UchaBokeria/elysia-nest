import { appEntryPoint } from './src/app'

;(async function main() {
  const app = await appEntryPoint()

  app.listen(3000)
  console.log(`Running On http://localhost:3000`)
}())
