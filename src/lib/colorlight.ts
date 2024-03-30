import { Eth } from './eth'
import { type Bitmap } from './Bitmap'
import { type Mosaic } from './Mosaic'
import {delay} from './utils'

// Check https://github.com/FalconChristmas/fpp/blob/master/src/channeloutput/ColorLight-5a-75.cpp
export class ColorLight {
  width: number
  height: number
  brightnessPercent: number
  brightnessValue: number
  frame0107DataLength: number
  frame0affDataLength: number
  frame5500DataLength: number
  frameData0107: Uint8Array
  frameData0aff: Uint8Array
  frameData5500: Uint8Array
  eth: Eth
  src_mac: bigint
  dest_mac: bigint
  flags: number

  constructor (width: number, height: number, private readonly ethName: string) {
    this.width = width
    this.height = height

    this.brightnessPercent = 1
    this.brightnessValue = 0x28

    this.frame0107DataLength = 98
    this.frame0affDataLength = 63
    this.frame5500DataLength = this.width * 3 + 7
    this.frameData0107 = new Uint8Array(this.frame0107DataLength).fill(0)
    this.frameData0aff = new Uint8Array(this.frame0affDataLength).fill(0)
    this.frameData5500 = new Uint8Array(this.frame5500DataLength).fill(0)
    this.initFrames()

    this.eth = new Eth(ethName)
    // Hardcoded value, take them as is
    this.src_mac = 0x222233445566n
    this.dest_mac = 0x112233445566n
    this.flags = 0
    this.eth.socketOpen()
  }

  setBrightness (percent: number): void {
    this.brightnessPercent = percent
    this.brightnessValue = Math.floor(Math.min(Math.max(percent, 0), 100) / 100 * 256)
    this.initFrames()
  }

  private initFrames (): void {
    this.frameData0107[21] = this.brightnessPercent
    this.frameData0107[22] = 5
    this.frameData0107[24] = this.brightnessPercent
    this.frameData0107[25] = this.brightnessPercent
    this.frameData0107[26] = this.brightnessPercent

    this.frameData0aff[0] = this.brightnessValue
    this.frameData0aff[1] = this.brightnessValue
    this.frameData0aff[2] = 255

    // Row Number LSB. We'll fill this up when sending
    this.frameData5500[0] = 0
    // MSB of pixel offset for this packet
    this.frameData5500[1] = 0
    // LSB of pixel offset for this packet
    this.frameData5500[2] = 0
    // MSB of pixel count in packet
    this.frameData5500[3] = this.width >> 8
    // LSB of pixel count in packet
    this.frameData5500[4] = this.width % 0xFF
    // No one knows
    this.frameData5500[5] = 0x08
    // No one knows
    this.frameData5500[6] = 0x88
  }

  private frame5500fromImage (ledRow: number, xOffset: number, bitmapRow: number, bitmap: Bitmap): void {
    this.frameData5500[0] = ledRow
    for (let col = 0, destOffset = 7 + xOffset * 3, srcOffset = bitmapRow * bitmap.width * 4; col < Math.min(this.width - xOffset, bitmap.width); ++col) {
      this.frameData5500[destOffset++] = bitmap.data[srcOffset + 2]
      this.frameData5500[destOffset++] = bitmap.data[srcOffset + 1]
      this.frameData5500[destOffset++] = bitmap.data[srcOffset]
      srcOffset += 4
    }
  }

  sendBrightness (): void {
    this.eth.send(this.src_mac, this.dest_mac, 0x0a00 + this.brightnessValue, this.frameData0aff,
      this.frame0affDataLength, this.flags)
  }

  async showImage (bitmap: Bitmap, xOffset = 0, yOffset = 0): Promise<void> {
    // Send one complete frame
    this.eth.send(this.src_mac, this.dest_mac, 0x0101, this.frameData0107, this.frame0107DataLength, this.flags)
    for (let i = 0; i < Math.min(this.height - yOffset, bitmap.height); ++i) {
      const y = i + yOffset
      this.frame5500fromImage(y, xOffset, i, bitmap)
      this.frameData5500[0] = y
      // TODO etherType probably 0x5501 if sending row over 256 https://github.com/FalconChristmas/fpp/blob/master/src/channeloutput/ColorLight-5a-75.cpp#L39C44-L39C47
      this.eth.send(this.src_mac, this.dest_mac, 0x5500, this.frameData5500, this.frame5500DataLength, this.flags)
    }

    // Without the following delay the end of the bottom row module flickers in the last line
    await delay(1)
  }

  async showMosaic (mosaic: Mosaic): Promise<void> {
    // Send one complete frame
    this.eth.send(this.src_mac, this.dest_mac, 0x0101, this.frameData0107, this.frame0107DataLength, this.flags)
    for (let i = 0; i < this.height; ++i) {
      const y = i
      mosaic.fillRowBuffer(this.frameData5500, 7, i)
      this.frameData5500[0] = y
      // TODO etherType probably 0x5501 if sending row over 256 https://github.com/FalconChristmas/fpp/blob/master/src/channeloutput/ColorLight-5a-75.cpp#L39C44-L39C47
      this.eth.send(this.src_mac, this.dest_mac, 0x5500, this.frameData5500, this.frame5500DataLength, this.flags)
    }

    // Without the following delay the end of the bottom row module flickers in the last line
    await delay(1)
  }
}
