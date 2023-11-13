import { StoreListImplProps } from '@owlmeans/vc-lib-react/dist/component'
import { List } from 'react-native-paper'
import { FC } from 'react'
import { View } from 'react-native'

export const StoreListNative: FC<StoreListImplProps> = ({ stores }) => {
  return <View>
    {
      stores.map(
        store => <List.Item key={store.alias} title={store.name} />
      )
    }

  </View>
}
