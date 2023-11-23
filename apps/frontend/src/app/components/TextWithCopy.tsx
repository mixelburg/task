import { FC } from 'react'
import { IconButton, Stack, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import copy from 'copy-to-clipboard'
import { stopPropagationWrapper } from "../utils/general";

interface IProps {
  text: string
  wrap?: boolean
}

const TextWithCopy: FC<IProps> = (props) => {
  const onClick = () => {
    copy(props.text)
  }

  const wrap = props.wrap === undefined ? true : props.wrap

  const wrapStyle = wrap ? {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  } : {}

  return <Stack direction='row' width='100%' alignItems='center' justifyContent='space-between'>
    <Typography
      sx={{
        direction: 'ltr',
        ...wrapStyle,
      }}
    >{props.text}</Typography>
    <IconButton onClick={stopPropagationWrapper(onClick)} size='small'>
      <ContentCopyIcon fontSize='small' />
    </IconButton>
  </Stack>
}

export default TextWithCopy
