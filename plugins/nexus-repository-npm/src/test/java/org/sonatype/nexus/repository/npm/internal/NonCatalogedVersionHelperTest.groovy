/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
package org.sonatype.nexus.repository.npm.internal

import org.sonatype.nexus.blobstore.api.Blob
import org.sonatype.nexus.blobstore.api.BlobId
import org.sonatype.nexus.blobstore.api.BlobRef
import org.sonatype.nexus.blobstore.api.BlobStore
import org.sonatype.nexus.capability.CapabilityReference
import org.sonatype.nexus.capability.CapabilityRegistry
import org.sonatype.nexus.common.collect.NestedAttributesMap
import org.sonatype.nexus.common.event.EventManager
import org.sonatype.nexus.repository.Repository
import org.sonatype.nexus.repository.config.Configuration
import org.sonatype.nexus.repository.firewall.event.ComponentDetailsRequest
import org.sonatype.nexus.repository.storage.Asset
import org.sonatype.nexus.repository.storage.StorageFacet

import groovy.json.JsonBuilder
import org.junit.Test
import spock.lang.Specification
import spock.lang.Unroll

import static java.lang.Boolean.FALSE
import static java.lang.Boolean.TRUE
import static org.hamcrest.Matchers.equalTo
import static org.junit.Assert.assertThat
import static org.sonatype.nexus.repository.npm.internal.NonCatalogedVersionHelper.REMOVE_NON_CATALOGED_KEY
import static org.sonatype.nexus.repository.npm.internal.NpmFormat.NAME

class NonCatalogedVersionHelperTest
    extends Specification
{

  public static final String PACKAGE_NAME = 'my_package'
  public static final String PACKAGE_NAME_WITH_NAMESPACE = '@sonatype/my_package'

  @Unroll
  def "It will add field matchers for non cataloged versions only"() {
    given:
      CapabilityRegistry capabilityRegistry = Mock() {
        get(_) >> [Mock(CapabilityReference)]
      }
      EventManager eventManager = Mock() {
        1 * post(_ as ComponentDetailsRequest) >> { ComponentDetailsRequest r -> r.getResult().complete(versionDates) }
      }
      def previousVersionLimit = 5
      def componentDetailsTimeout = 10
      def nonCatalogedVersionHelper = new NonCatalogedVersionHelper(eventManager, capabilityRegistry,
          previousVersionLimit, componentDetailsTimeout)
      Repository repo = Mock(Repository) {
        getName() >> 'myrepo'
        getConfiguration() >> Mock(Configuration) {
          attributes(NAME) >> new NestedAttributesMap('npm', [(REMOVE_NON_CATALOGED_KEY): TRUE])
        }
        facet(StorageFacet) >> Mock(StorageFacet) {
          blobStore() >> Mock(BlobStore) {
            get(_ as BlobId) >> Mock(Blob) {
              getInputStream() >> new ByteArrayInputStream(packageJson(versions, latest))
            }
          }
        }
      }
      Asset packageRoot = Mock() {
        blobRef() >> Mock(BlobRef) {
          getBlobId() >> Mock(BlobId)
        }
        name() >> packageName
      }
      List<NpmFieldMatcher> matchers = []
    when:
      nonCatalogedVersionHelper.maybeAddExcludedVersionsFieldMatchers(matchers, packageRoot, repo)
    then:
      matchers.size() == expectedSize
      def matcherFieldNames = matchers.collect { it.getFieldName() }
      matcherFieldNames == expectedMatchers


    where:
      // @formatter:off
      expectedSize | expectedMatchers  | packageName                 | latest | versions       | versionDates
      0            | []                | PACKAGE_NAME                | '1.0'  | ['1.0']        | ['pkg:npm/my_package@1.0': new Date()]
      0            | []                | PACKAGE_NAME                | '1.0'  | ['1.0']        | ['pkg:npm/my_package@1.0': new Date()]
      0            | []                | PACKAGE_NAME                | '1.1'  | ['1.0', '1.1'] | ['pkg:npm/my_package@1.0': new Date(), 'pkg:npm/my_package@1.1': new Date()]
      2            | ['1.1', 'latest'] | PACKAGE_NAME                | '1.1'  | ['1.0', '1.1'] | ['pkg:npm/my_package@1.0': new Date(), 'pkg:npm/my_package@1.1': null]
      0            | []                | PACKAGE_NAME                | '1.1'  | ['1.0', '1.1'] | [:]
      // These demonstrate workaround works for CLM-16740
      2            | ['1.1', 'latest'] | PACKAGE_NAME_WITH_NAMESPACE | '1.1'  | ['1.0', '1.1'] | ['pkg:npm/%2540sonatype/my_package@1.0': new Date(), 'pkg:npm/%2540sonatype/my_package@1.1': null]
      2            | ['1.1', 'latest'] | PACKAGE_NAME_WITH_NAMESPACE | '1.1'  | ['1.0', '1.1'] | ['pkg:npm/%40sonatype/my_package@1.0': new Date(), 'pkg:npm/%40sonatype/my_package@1.1': null]
      // @formatter:on
  }

  byte[] packageJson(List<String> versions, final String latest) {
    new JsonBuilder([
        name       : PACKAGE_NAME,
        'dist-tags': [latest: latest],
        versions   : versions.collectEntries { [(it): {}] },
        '_ref'     : PACKAGE_NAME
    ]).toPrettyString().bytes
  }

  @Unroll
  def "It will not evaluate versions if firewall is disabled or setting is off"() {
    given:
      CapabilityRegistry capabilityRegistry = Mock()
      EventManager eventManager = Mock()
      def previousVersionLimit = 5
      def componentDetailsTimeout = 10
      def nonCatalogedVersionHelper = new NonCatalogedVersionHelper(eventManager, capabilityRegistry,
          previousVersionLimit, componentDetailsTimeout)
      Repository repo = Mock(Repository) {
        getName() >> 'myrepo'
        getConfiguration() >> Mock(Configuration) {
          attributes(NAME) >> new NestedAttributesMap('npm', [(REMOVE_NON_CATALOGED_KEY): nonCatalogedConfig])
        }
      }
      List<NpmFieldMatcher> matchers = []
      Asset packageRoot = Mock()
    when:
      nonCatalogedVersionHelper.maybeAddExcludedVersionsFieldMatchers(matchers, packageRoot, repo)
    then:
      0 * packageRoot.blobRef()
      0 * eventManager.post(_ as ComponentDetailsRequest)
      capabilityRegistryInvocations * capabilityRegistry.get(_) >> firewallCapibilities

    where:
      nonCatalogedConfig | firewallCapibilities        | capabilityRegistryInvocations
      TRUE               | []                          | 1
      FALSE              | [Mock(CapabilityReference)] | 0

  }

  @Test
  void 'It will return last 5 or all versions'() {
    expect:
      assertThat(NonCatalogedVersionHelper.last(n, versions), equalTo(expected))
    where:
      n | versions                            | expected
      5 | []                                  | []
      5 | ['a']                               | ['a']
      5 | ['a', 'b']                          | ['a', 'b']
      5 | ['a', 'b', 'c', 'd', 'e']           | ['a', 'b', 'c', 'd', 'e']
      5 | ['a', 'b', 'c', 'd', 'e', 'f']      | ['b', 'c', 'd', 'e', 'f']
      5 | ['a', 'b', 'c', 'd', 'e', 'f', 'g'] | ['c', 'd', 'e', 'f', 'g']
      2 | ['a', 'b', 'c', 'd', 'e', 'f', 'g'] | ['f', 'g']
  }
}
