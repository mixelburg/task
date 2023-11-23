import { FC, PropsWithChildren, useState } from 'react'
import { useTheme } from '@mui/material'
import { NavLink } from 'react-router-dom'

const AppLink: FC<PropsWithChildren<{ to: string; color?: string }>> = ({ to, color, children }) => {
  const theme = useTheme()
  const [active, setActive] = useState<boolean>(false)
  return (
    <NavLink
      to={to}
      className={({ isActive }) => setActive(isActive) as any}
      style={{
        textDecoration: 'none',
        color: active ? theme.palette.primary.main : color || theme.palette.text.primary,
        whiteSpace: 'nowrap',
      }}
      end
    >
      {children}
    </NavLink>
  )
}

export default AppLink
