import dayjs from 'dayjs'

export function sleep(timeout: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(0), timeout)
  })
}

export function formatAccount(addr: string, length = 5) {
  const start = addr.slice(0, length)
  const end = addr.slice(-length)
  return `${start}...${end}`
}

export async function checkImg(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

export function timeFormat(time: number) {
  if (time.toString().length === 10) time *= 1000
  return dayjs(time).format('MM/DD HH:mm')
}
