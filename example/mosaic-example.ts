import fs from 'fs/promises'
import { ColorLight } from '../src/main'
import { Mosaic } from '../src/lib/Mosaic'
import { delay } from '../src/lib/utils'

const LEDWidth = 256
const LEDHeight = 256

const args = process.argv.slice(2)
void main(args[0], parseInt(args[1]), parseInt(args[2]))
async function main (imageFile: string, width: number, height: number): Promise<void> {
  const nic = 'enp7s0'
  const delayTime = 1000 / 100

  const mosaic = new Mosaic(64, 64, 4, 2)
  const led = new ColorLight(LEDWidth, LEDHeight, nic)
  led.setBrightness(100)
  led.sendBrightness()

  const imgRawData = await fs.readFile(imageFile.toString()) // some raw bitmap file no headers
  mosaic.setTile(0, 1, {
    data: imgRawData,
    width: 64,
    height: 64
  })
  while (true) {
    await led.showMosaic(mosaic)
    await delay(delayTime)
  }
}
