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
package org.sonatype.nexus.webapp.metrics;

import java.io.IOException;
import java.lang.management.ManagementFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.codahale.metrics.JvmAttributeGaugeSet;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.jvm.BufferPoolMetricSet;
import com.codahale.metrics.jvm.FileDescriptorRatioGauge;
import com.codahale.metrics.jvm.GarbageCollectorMetricSet;
import com.codahale.metrics.jvm.MemoryUsageGaugeSet;
import com.codahale.metrics.jvm.ThreadStatesGaugeSet;
import com.codahale.metrics.servlets.MetricsServlet;

import static com.codahale.metrics.MetricRegistry.name;
import static com.google.common.net.HttpHeaders.CONTENT_DISPOSITION;

/**
 * Customized {@link com.codahale.metrics.servlets.MetricsServlet} to support injection and download.
 *
 * @since 2.next
 */
@Singleton
public class NexusMetricsServlet
  extends MetricsServlet
{
  @Inject
  public NexusMetricsServlet(final MetricRegistry registry) {
    super(registry);
  }

  @Override
  protected void doGet(final HttpServletRequest req, final HttpServletResponse resp)
      throws ServletException, IOException
  {
    boolean download = Boolean.parseBoolean(req.getParameter("download"));
    if (download) {
      resp.addHeader(CONTENT_DISPOSITION, "attachment; filename='metrics.json'");
    }

    super.doGet(req, resp);
  }
}
