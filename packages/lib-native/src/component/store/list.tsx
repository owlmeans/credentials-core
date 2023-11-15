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
import { StoreListImplProps } from '@owlmeans/vc-lib-react/dist/component'
import { Button, List, Text } from 'react-native-paper'
import { FC } from 'react'
import { Grid } from '../grid/grid'

export const StoreListNative: FC<StoreListImplProps> = ({ t, stores, create }) => {
  return <Grid container>
    <Grid item container space={1} direction="row">
      <Grid item space={3}><Text variant="headlineLarge">{t('list.title')}</Text></Grid>
      <Grid item space={2}><Button onPress={create}>{t('list.create')}</Button></Grid>
    </Grid>
    <Grid item space={11}>
      {stores.length > 0 ? stores.map(
        store => <List.Item key={store.alias} title={store.name} />
      ) : <List.Item title={t('list.empty')} />}
    </Grid>
  </Grid>
}
