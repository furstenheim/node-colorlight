import fs from 'fs/promises'
import { ColorLight, delay } from './lib/colorlight'
import { Image } from 'imagescript'

const LEDWidth = 256
const LEDHeight = 256

const args = process.argv.slice(2)
void main(args[0], parseInt(args[1]), parseInt(args[2]))
async function main (imageFile: string, width: number, height: number): Promise<void> {
  const nic = 'enp7s0'
  const delayTime = 1000 / 100
  const brightness = 100

  const led = new ColorLight(LEDWidth, LEDHeight, nic)
  led.brightness = brightness
  const imgRawData = await fs.readFile(imageFile.toString())
  const image = await Image.decode(imgRawData)
  console.log(image.width, image.height)
  while (true) {
    await led.showImage({
      data: image.bitmap,
      width: image.width,
      height: image.height
    }, 128 + 64, 0)
    await delay(delayTime)
  }
}
