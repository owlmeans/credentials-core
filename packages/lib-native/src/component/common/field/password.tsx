import { WrappedComponentProps, formatError } from '@owlmeans/vc-lib-react/dist/shared'
import { FC } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { HelperText, TextInput } from 'react-native-paper'

export const PasswordInput: FC<PasswordInputProps> = ({ t, field, rules }) => {
  const { control } = useFormContext()

  return <Controller control={control} name={field}
    rules={rules && rules[field]}
    render={
      ({ field: _field, fieldState }) => <>
        <TextInput {..._field} secureTextEntry onChangeText={_field.onChange}
          value={_field.value}
          label={`${t(field + '.label')}`} error={fieldState.error != null}
        />
        <HelperText type={fieldState.error == null ? 'info' : 'error'} visible={true}>{
          fieldState.error ? formatError(t, field, fieldState) : t(field + `.hint`)
        }</HelperText>
      </>
    } />
}

export type PasswordInputProps = WrappedComponentProps<{
  field: string
}>
