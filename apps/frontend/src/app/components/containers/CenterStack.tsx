import { Stack, StackProps, styled } from '@mui/material'

const CenterStack = styled(Stack)<StackProps>(() => ({
  height: '100%',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
}))

export default CenterStack
