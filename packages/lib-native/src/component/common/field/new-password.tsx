import { WrappedComponentProps, formatError } from '@owlmeans/vc-lib-react/dist/shared'
import { FC } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { HelperText, TextInput } from 'react-native-paper'

export const NewPasswordInput: FC<NewPasswordInputProps> = ({ t, field, rules }) => {
  const { control } = useFormContext()

  return <>
    <Controller control={control} name="creation.password.input"
      rules={rules && rules['creation.password.input']}
      render={
        ({ field: _field, fieldState }) => <>
          <TextInput {..._field} onChangeText={_field.onChange} secureTextEntry
            label={`${t(field + '.input.label')}`} error={fieldState.error != null}
          />
          <HelperText type={fieldState.error == null ? 'info' : 'error'} visible={true}>{
            fieldState.error ? formatError(t, field + '.input', fieldState) : t(field + `.input.hint`)
          }</HelperText>
        </>
      } />
    <Controller control={control} name="creation.password.confirm" render={
      ({ field: _field, fieldState }) => <>
        <TextInput {..._field} onChangeText={_field.onChange} secureTextEntry
            label={`${t(field + '.confirm.label')}`} error={fieldState.error != null}
          />
          <HelperText type={fieldState.error == null ? 'info' : 'error'} visible={true}>{
            fieldState.error ? formatError(t, field + '.confirm', fieldState) : t(field + `.confirm.hint`)
          }</HelperText>
      </>
    } />
  </>
}

export type NewPasswordInputProps = WrappedComponentProps<{
  field: string
}>