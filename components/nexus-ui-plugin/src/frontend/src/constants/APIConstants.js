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

export default {
  EXT: {
    URL: '/service/extdirect',
    REPOSITORY: {
      ACTION: 'coreui_Repository',
      METHODS: {
        READ_WITH_FOR_ALL: 'readReferencesAddingEntryForAll',
      }
    },
    PROPRIETARY_REPOSITORIES: {
      ACTION: 'coreui_ProprietaryRepositories',
      METHODS: {
        READ: 'read',
        UPDATE: 'update',
        POSSIBLE_REPOS: 'readPossibleRepos',
      },
    },
    BLOBSTORE: {
      ACTION: 'coreui_Blobstore',
      METHODS: {
        READ_NAMES: 'readNames',
      },
    },
    HEALTH_CHECK: {
      ACTION: 'healthcheck_Status',
      METHODS: {
        READ: 'read',
        UPDATE: 'update',
        ENABLE_ALL: 'enableAll'
      }
    },
    FIREWALL_REPOSITORY_STATUS: {
      ACTION: 'firewall_RepositoryStatus',
      METHODS: {
        READ: 'read'
      }
    },
    PRIVILEGE: {
      ACTION: 'coreui_Privilege',
      METHODS: {
        READ: {
          NAME: 'read',
          DATA: [{
            page: 1,
            limit: 300,
            start: 0,
            sort: [{
              direction: 'ASC',
              property: 'name',
            }],
          }],
        },
        READ_TYPES: 'readTypes',
      },
    },
    USER: {
      ACTION: 'coreui_User',
      METHODS: {
        READ: 'read',
        READ_SOURCES: 'readSources',
        UPDATE_ROLE_MAPPINGS: 'updateRoleMappings',
      },
    },
    SMALL_PAGE_SIZE: 25,
    MIDDLE_PAGE_SIZE: 50,
    BIG_PAGE_SIZE: 300,
    DEFAULT_FIELD_CONFIG: {
      id: 'id',
      type: 'string',
      label: 'Label',
      helpText: 'helpText',
      required: true,
      disabled: false,
      readOnly: false,
      regexValidation: null,
      initialValue: null,
      attributes: {},
      minValue: null,
      maxValue: null,
      storeApi: null,
      storeFilters: null,
      idMapping: null,
      nameMapping: null,
      allowAutocomplete: false,
    },
    HTTP: {
      ACTION: 'coreui_HttpSettings',
      METHODS: {
        READ: 'read',
        UPDATE: 'update'
      }
    },
    SSL: {
      ACTION: 'ssl_Certificate',
      METHODS: {
        DETAILS: 'details',
        RETRIEVE_FROM_HOST: 'retrieveFromHost'
      }
    },
    LDAP: {
      ACTION: 'ldap_LdapServer',
      METHODS: {
        CLEAR_CACHE: 'clearCache',
        VERIFY_CONNECTION: 'verifyConnection',
        READ_TEMPLATES: 'readTemplates'
      }
    }
  },
  REST: {
    INTERNAL: {
      BASE_URL: 'service/rest/internal/ui/',
      get REPOSITORIES() {
        return `${this.BASE_URL}repositories/`;
      },
      get REPOSITORIES_DETAILS() {
        return `${this.REPOSITORIES}details/`;
      },
      get REPOSITORIES_REPOSITORY() {
        return `${this.REPOSITORIES}repository/`;
      },
      get CURRENT_USER() {
        return `${this.BASE_URL}user/`;
      },
      get SUPPORT_ZIP() {
        return `${this.BASE_URL}supportzip/`;
      },
      get GET_SUPPORT_ZIP_ACTIVE_NODES() {
        return `${this.BASE_URL}supportzip/activenodes`;
      },
      get GET_ZIP_STATUS() {
        return `${this.BASE_URL}supportzip/status/`;
      },
      get CLEAR_SUPPORT_ZIP_HISTORY() {
        return `${this.BASE_URL}supportzip/clear/`;
      }
    },
    PUBLIC: {
      BASE_URL: '/service/rest/v1/',
      get REPOSITORIES() {
        return `${this.BASE_URL}repositories/`;
      },
      get PRIVILEGES() {
        return `${this.BASE_URL}security/privileges`;
      },
      get USERS() {
        return `${this.BASE_URL}security/users`;
      },
      get ROLES() {
        return `${this.BASE_URL}security/roles`;
      },
      get ACTIVE_REALMS() {
        return `${this.BASE_URL}security/realms/active`;
      },
      get AVAILABLE_REALMS() {
        return `${this.BASE_URL}security/realms/available`;
      },
      get SSL_CERTIFICATES() {
        return `${this.BASE_URL}security/ssl/truststore`;
      },
      get SSL_CERTIFICATE_DETAILS() {
        return `${this.BASE_URL}security/ssl`;
      },
      get EMAIL_SERVER() {
        return `${this.BASE_URL}email`;
      },
      get VERIFY_EMAIL_SERVER() {
        return `${this.BASE_URL}email/verify`;
      },
      get LICENSE() {
        return `${this.BASE_URL}system/license`;
      },
      get LDAP_SERVERS() {
        return `${this.BASE_URL}security/ldap`;
      },
      get LDAP_CHANGE_ORDER() {
        return `${this.BASE_URL}security/ldap/change-order`;
      },
      get USER_TOKENS() {
        return `${this.BASE_URL}security/user-tokens`;
      },
    },
  },
  DEBOUNCE_DELAY: 500,
  SORT_DIRECTIONS: {
    DESC: 'desc',
    ASC: 'asc',
  },
};
