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
import { FC } from 'react'
import { GridProps } from './types'
import { StyleSheet, View, ViewStyle } from 'react-native'

export const Grid: FC<GridProps> = ({
  direction, space, style,
  container, item, children,
  justify, align
}) => {
  const styles: ViewStyle[] = [{
    flex: space ?? 1,
    flexDirection: direction ?? 'column',
    ...style
  }]

  if (container === true) {
    styles.push(gridStyles.container)
  }
  if (item === true) {
    styles.push(gridStyles.item)
  }
  if (justify != null) {
    styles.push({ justifyContent: justify })
  }
  if (align != null) {
    styles.push({ alignItems: align })
  }

  return <View style={styles}>{children}</View>
}

Grid.displayName = "Grid"

export const gridStyles = StyleSheet.create({
  container: {
    // justifyContent: 'space-between',
    // alignItems: 'stretch'
  },
  item: {
    // justifyContent: 'center',
  }
})
