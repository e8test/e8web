import { useState, useEffect } from 'react'

interface IState {
  [key: string]: any
}

const states: IState = {}

export default function useMemoState<T>(
  key: string,
  defaultValue?: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(states[key] || defaultValue)

  useEffect(() => {
    states[key] = state
  }, [key, state])

  return [state, setState]
}
