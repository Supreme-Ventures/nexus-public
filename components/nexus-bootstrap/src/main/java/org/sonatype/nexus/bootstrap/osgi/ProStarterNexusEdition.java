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
package org.sonatype.nexus.bootstrap.osgi;

import java.io.File;
import java.nio.file.Path;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProStarterNexusEdition
    extends NexusEdition
{
  private static final String EDITION_PRO_STARTER_PATH = "edition_pro_starter";

  private static final String PRO_STARTER_LICENSE_LOCATION = "/com/sonatype/nexus/pro-starter";

  private static final Logger log = LoggerFactory.getLogger(ProStarterNexusEdition.class);

  @Override
  public NexusEditionType getEdition() {
    return NexusEditionType.PRO_STARTER;
  }

  @Override
  public NexusEditionFeature getEditionFeature() {
    return NexusEditionFeature.PRO_STARTER_FEATURE;
  }

  @Override
  protected boolean doesApply(final Properties properties, final Path workDirPath) {
    File proStarterEditionMarker = getEditionMarker(workDirPath);
    if (hasNexusLoadAs(NEXUS_LOAD_AS_OSS_PROP_NAME)) {
      return false;
    }
    if (hasNexusLoadAs(NEXUS_LOAD_AS_PRO_STARTER_PROP_NAME)) {
      return true;
    }
    if (proStarterEditionMarker.exists()) {
      return true;
    }
    return !isNullJavaPrefLicensePath(PRO_STARTER_LICENSE_LOCATION) &&
        hasFeature(properties, getEditionFeature().featureString);
  }

  @Override
  protected void doApply(final Properties properties, final Path workDirPath) {
    log.info("Loading Pro Starter Edition");
    properties.put(NEXUS_EDITION, NexusEditionType.PRO_STARTER.editionString);
    String updatedNexusFeaturesProps = properties.getProperty(NEXUS_FEATURES)
        .replace(NexusEditionFeature.PRO_FEATURE.featureString, getEditionFeature().featureString);

    properties.put(NEXUS_FEATURES, updatedNexusFeaturesProps);
    createEditionMarker(workDirPath, getEdition());
  }

  @Override
  protected File getEditionMarker(final Path workDirPath) {
    return workDirPath.resolve(EDITION_PRO_STARTER_PATH).toFile();
  }
}
