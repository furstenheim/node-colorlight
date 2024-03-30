import fs from 'fs/promises'
import { ColorLight } from '../src/main'
import { Image } from 'imagescript'
import {delay} from '../src/lib/utils'

const LEDWidth = 256
const LEDHeight = 256

const args = process.argv.slice(2)
void main(args[0], parseInt(args[1]), parseInt(args[2]))
async function main (imageFile: string, width: number, height: number): Promise<void> {
  const nic = 'enp7s0'
  const delayTime = 1000 / 100
  const brightness = 100

  const led = new ColorLight(LEDWidth, LEDHeight, nic)
  led.setBrightness(brightness)
  led.sendBrightness()
  const imgRawData = await fs.readFile(imageFile.toString())
  const image = await Image.decode(imgRawData)
  while (true) {
    await led.showImage({
      data: image.bitmap,
      width: image.width,
      height: image.height
    }, 64, 0)
    await delay(delayTime)
  }
}
