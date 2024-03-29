import { socketClose, socketOpen, socketSend } from './sendeth'
export class Eth {
  private readonly deviceName: string
  private socketFD = 0

  constructor (device: string) {
    this.deviceName = device
  }

  socketOpen (): void {
    const DevNameMaxLength = 128

    if (this.deviceName.length >= DevNameMaxLength) {
      throw new Error('Device name is too long (>128 chars)')
    }
    this.socketFD = socketOpen(this.deviceName)
  }

  socketClose (): number {
    if (this.socketFD !== 0) { return socketClose(this.socketFD) } else { throw new Error('Cannot close socket before opening it') }
  }

  // int socket_send(unsigned long int src_mac, unsigned long int dest_mac, unsigned int ether_type, uint8_t *data, int len, unsigned int flags)
  send (srcMac: bigint, destMac: bigint, etherType: number, buf: Uint8Array, len: number, flags: number): number {
    if (this.socketFD !== 0) { return socketSend(this.socketFD, srcMac, destMac, etherType, buf, len, flags) } else { throw new Error('Open socket before sending traffic') }
  }
}
