/**
 *  Copyright 2023 OwlMeans
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import { StoreCreationFields, StoreCreationImplProps } from '@owlmeans/vc-lib-react/dist/shared'
import { FC } from 'react'
import { FormProvider, UseFormProps, useForm } from 'react-hook-form'
import { Grid } from '../grid'
import { Button } from 'react-native-paper'
import { MainTextInput, NewPasswordInput } from '../common'
import { cryptoHelper } from '@owlmeans/vc-core'

export const StoreCreationNative: FC<StoreCreationImplProps> = (props) => {
  const { t, form } = props
  const methods = useForm<StoreCreationFields>(form as UseFormProps<StoreCreationFields>)

  return <FormProvider {...methods}>
    <Grid container justify="flex-start">
      <Grid item>
        <MainTextInput {...props} field="creation.name" />
        <MainTextInput {...props} field="creation.login" />
        <NewPasswordInput {...props} field="creation.password" />
      </Grid>
      <Grid item justify="flex-end" align="center" style={{ paddingBottom: '20%' }}>
        <Button mode="contained" style={{ width: '90%' }} onPress={
          methods.handleSubmit(props.create(methods, cryptoHelper))
        }>{t('creation.create')}</Button>
      </Grid>
    </Grid>
  </FormProvider>
}
