import { FC } from 'react'
import { Stack } from '@mui/material'
import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/monikai.css'

interface IProps {
  data: any
}

const JsonPrettyWrapper: FC<IProps> = (props) => {
  return <Stack
    sx={{
      '.__json-pretty__': {
        p: 1,
        m: 0,
      },
    }}
  >
    <JSONPretty data={props.data} />
  </Stack>
}

export default JsonPrettyWrapper
