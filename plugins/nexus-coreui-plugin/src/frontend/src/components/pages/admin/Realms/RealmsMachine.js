/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Open Source Version is distributed with Sencha Ext JS pursuant to a FLOSS Exception agreed upon
 * between Sonatype, Inc. and Sencha Inc. Sencha Ext JS is licensed under GPL v3 and cannot be redistributed as part of a
 * closed source work.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
import {assign} from 'xstate';
import Axios from 'axios';
import {mergeDeepRight} from 'ramda';
import {FormUtils, APIConstants} from '@sonatype/nexus-ui-plugin';

import UIStrings from '../../../../constants/UIStrings';

const {REALMS: {MESSAGES}} = UIStrings;

const NX_AUTHENTICATING_REALM = 'NexusAuthenticatingRealm';
const NX_AUTHORIZING_REALM = 'NexusAuthorizingRealm';

export default FormUtils.buildFormMachine({
  id: 'RealmsMachine',
  config: (config) => mergeDeepRight(config, {
    states: {
      loaded: {
        on: {
          CHECK_LOCAL_REALM_REMOVAL: [
            {
              target: 'showLocalRealmRemovalModal',
              cond: 'isLocalRealmRemoval'
            },
            {
              target: 'saving',
              cond: 'canSave'
            }
          ]
        }
      },
      showLocalRealmRemovalModal: {
        on: {
          SAVE: {
            target: 'saving',
            cond: 'canSave'
          },
          CLOSE: {
            target: 'loaded'
          }
        }
      }
    }
  })
}).withConfig({
  actions: {
    validate: assign({
      validationErrors: ({data}) => ({
        active: data.active.length ? null : MESSAGES.NO_REALMS_CONFIGURED,
      }),
    }),
    setData: assign((_, event) => {
      const response = event.data || [];
      const available = response[0]?.data || [];
      const active = response[1]?.data || [];
      const data = {
        available,
        active,
      };

      return {
        data,
        pristineData: data,
      };
    }),
  },
  guards: {
    isLocalRealmRemoval: ({data, pristineData}) => 
      (pristineData.active?.includes(NX_AUTHENTICATING_REALM) && 
        !data.active?.includes(NX_AUTHENTICATING_REALM)) ||
      (pristineData.active?.includes(NX_AUTHORIZING_REALM) && 
        !data.active?.includes(NX_AUTHORIZING_REALM))
  },
  services: {
    fetchData: async () =>
      Axios.all([
        Axios.get(APIConstants.REST.PUBLIC.AVAILABLE_REALMS),
        Axios.get(APIConstants.REST.PUBLIC.ACTIVE_REALMS),
      ]),
    saveData: ({ data }) =>
      Axios.put(APIConstants.REST.PUBLIC.ACTIVE_REALMS, data.active),
  },
});
