/**
 *  Copyright 2023 OwlMeans, Inc
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

import { FunctionComponent } from 'react'
import { Extension } from '@owlmeans/vc-core'
import { EmptyProps, PurposeEvidenceWidgetParams, WalletComponentProps, withOwlWallet } from '@owlmeans/vc-lib-react'
import { getCompatibleSubject } from '@owlmeans/vc-core'
import { IdentitySubject } from '../../../types'
import { dateFormatter } from '@owlmeans/vc-lib-react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'


export const EvidenceWidget = (ext: Extension): FunctionComponent<EvidenceWidgetParams> =>
  withOwlWallet<EvidenceWidgetProps>({ namespace: ext.localization?.ns }, (props: EvidenceWidgetProps) => {
    const { wrapper, t } = props

    const subject = getCompatibleSubject<IdentitySubject>(wrapper.credential)

    return <Grid container direction="column" justifyContent="space-between" alignItems="space-between">
      <Grid item container px={1} direction="row" justifyContent="space-between" alignItems="flex-start">
        <Grid item container xs={10} pt={1} direction="column" justifyContent="space-between" alignItems="stretch">
          <Grid item>
            <Typography variant='overline'>ID: {subject.identifier}</Typography>
          </Grid>
        </Grid>
        {/* <Grid item container xs={2} pr={1} direction="row" justifyContent="flex-end" alignItems="flex-end">
          <Grid item>
            <MenuIconButton handle={handle} />
            <ItemMenu handle={handle} content={identityWrap.credential} i18n={i18n} prettyOutput
              exportTitle={`${identityWrap.meta.title}.identity`} />
          </Grid>
        </Grid> */}
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{`${t('widget.evidence.uuid')}`}: {subject.uuid}</Typography>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{`${t('widget.evidence.issuedAt')}`}: {dateFormatter(subject.createdAt)}</Typography>
      </Grid>
      <Grid item px={1}>
        <Typography variant='overline'>{`${t('widget.evidence.sourceApp')}`}: {subject.sourceApp}</Typography>
      </Grid>
    </Grid>
  })

export type EvidenceWidgetParams = EmptyProps & PurposeEvidenceWidgetParams

export type EvidenceWidgetProps = WalletComponentProps<EvidenceWidgetParams>