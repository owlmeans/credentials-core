import React from 'react'

import { Button } from '@mui/material'
import { WrappedComponentProps } from '@owlmeans/regov-lib-react'
import { ButtonParams } from './types'


export const FormHeaderButton = ({ t, title, action }: FormHeaderButtonProps) =>
  <Button variant="contained" size="small" onClick={action}>{t(title)}</Button>

export type FormHeaderButtonProps = WrappedComponentProps<ButtonParams>