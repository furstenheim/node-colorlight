// Hold a list of images to avoid copying several buffers when only one updates
import { type Bitmap } from './Bitmap'
import { times } from './utils'

export class Mosaic {
  private readonly tiles: Array<Array<Bitmap | null>>
  private readonly width: number

  constructor (private readonly tileHeight: number, private readonly tileWidth: number, private readonly nTilesY: number, private readonly nTilesX: number) {
    this.tiles = times(nTilesX).map(() => times(nTilesY).map(() => null))
    this.width = tileWidth * nTilesX
  }

  setTile (row: number, column: number, bitmap: Bitmap | null): void {
    this.tiles[row][column] = bitmap
  }

  fillRowBuffer (buffer: Uint8Array, headerOffset: number, rowNumber: number): void {
    const xTile = Math.floor(rowNumber / this.tileHeight)
    const tileRowNumber = rowNumber % this.tileHeight
    const tileOffset = tileRowNumber * this.tileWidth * 4
    const tileRow = this.tiles[xTile]
    let destOffset = headerOffset
    for (let yTile = 0; yTile < this.nTilesY; yTile++) {
      const tile = tileRow[yTile]
      let srcOffset = tileOffset
      for (let col = 0; col < this.tileWidth; ++col) {
        if (tile === null) {
          buffer[destOffset++] = 0
          buffer[destOffset++] = 0
          buffer[destOffset++] = 0
        } else {
          buffer[destOffset++] = tile.data[srcOffset + 2]
          buffer[destOffset++] = tile.data[srcOffset + 1]
          buffer[destOffset++] = tile.data[srcOffset]
        }
        srcOffset += 4
      }
    }
  }
}
