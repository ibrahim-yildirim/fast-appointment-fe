// Excludes easily-confused characters (0/O, 1/I/L) so codes survive being read aloud.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

export function generateBookingReference() {
  let code = ""
  for (let index = 0; index < 6; index++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return `FA-${code}`
}
