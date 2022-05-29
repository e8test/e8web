import { Button } from '@arco-design/web-react'

import { isMobile } from '@/config'

interface Props {
  value: number
  onChange: (value: number) => void
  tabs: string[]
}

export default function ButtonTab(props: Props) {
  const value = props.value || 0
  return (
    <Button.Group>
      {props.tabs.map((item, index) => (
        <Button
          key={index}
          type={value === index ? 'primary' : 'outline'}
          onClick={() => props.onChange(index)}
          size={isMobile ? 'small' : 'default'}
        >
          {item}
        </Button>
      ))}
    </Button.Group>
  )
}
