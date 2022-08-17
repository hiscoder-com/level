import Image from 'next/image'

import Fulfilled from '../public/fulfilled.png'

function Avatars({ projectCode }) {
  return <Image src={Fulfilled} alt="Fulfilled" width="154" height="32" />
}

export default Avatars
