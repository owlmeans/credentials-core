import { WrappedComponentProps, formatError } from '@owlmeans/vc-lib-react/dist/shared'
import { FC, useEffect, useState } from 'react'
import { Controller, useController, useFormContext } from 'react-hook-form'
import { Snackbar } from 'react-native-paper'

export const AlertOutput: FC<AlertOutputProps> = ({ field, t }) => {
  const { control } = useFormContext()
  const { fieldState } = useController({ control, name: field })
  const [visible, setVisible] = useState<boolean>(fieldState.error != null)
  useEffect(() => { setVisible(fieldState.error != null) }, [fieldState.error])

  return <Controller control={control} name={field}
    render={({ field, fieldState }) => {
      return <Snackbar visible={visible} onDismiss={() => setVisible(false)}>
        {formatError(t, field.name, fieldState)}
      </Snackbar>
    }} />
}

export type AlertOutputProps = WrappedComponentProps<{
  field: string
}>
