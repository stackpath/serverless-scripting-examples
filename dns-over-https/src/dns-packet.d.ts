
declare module 'dns-packet' {
  const AUTHORITATIVE_ANSWER: number
  const TRUNCATED_RESPONSE: number
  const RECURSION_DESIRED: number
  const RECURSION_AVAILABLE: number
  const AUTHENTIC_DATA: number
  const CHECKING_DISABLED: number
  const DNSSEC_OK: number

  function decode(buf: Buffer, offset?: number): Packet
  function encode(packet: Packet, buf?: Buffer, offset?: number): Buffer

  interface Packet {
    type: 'query' | 'response'
    id?: number
    flags?: number
    questions: Question[]
    answers: Answer[]
    additionals?: object[]
  }

  interface Question {
    type: string
    class: string
    name: string
  }

  interface Answer {
    type: string
    class: string
    name: string
    data?: string
    ttl?: number
  }
}