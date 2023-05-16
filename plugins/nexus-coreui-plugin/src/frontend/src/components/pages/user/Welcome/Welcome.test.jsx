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
import React from 'react';
import axios from 'axios';
import { act, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { when } from 'jest-when';

import { ExtJS, ExtAPIUtils } from '@sonatype/nexus-ui-plugin';

import Welcome from './Welcome.jsx';
import * as testData from './Welcome.testdata.js';

// Creates a selector function that uses getByRole by default but which can be customized per-use to use
// queryByRole, findByRole, etc instead
const selectorQuery = (...queryParams) => queryType => screen[`${queryType ?? 'get'}ByRole`].apply(screen, queryParams);

const selectors = {
  main: () => screen.getByRole('main'),
  loadingStatus: () => screen.getByRole('status'),
  errorAlert: selectorQuery('alert'),
  errorRetryBtn: selectorQuery('button', { name: 'Retry' }),
  outreachFrame: selectorQuery('document', { name: 'Outreach Frame' }),
  firewallCapabilityNotice: selectorQuery('region', { name: 'Firewall Capability Notice' })
};

const browseableFormats = [{id: 'test'}];

describe('Welcome', function() {
  let user;

  beforeEach(function() {
    user = null;

    jest.spyOn(axios, 'post').mockResolvedValue(testData.simpleSuccessResponse)
    jest.spyOn(ExtJS, 'useStatus').mockReturnValue({});
    jest.spyOn(ExtJS, 'useLicense').mockReturnValue({});
    jest.spyOn(ExtJS, 'useUser').mockImplementation(() => user);
    jest.spyOn(ExtJS, 'state').mockReturnValue({ getUser: () => user, getValue: () => browseableFormats});
  });

  it('renders a main content area', function() {
    // resolving the promise in this otherwise-synchronous test causes act errors, so just leave it unresolved here
    jest.spyOn(axios, 'post').mockReturnValue(new Promise(() => {}));
    render(<Welcome />);

    expect(selectors.main()).toBeInTheDocument();
  });

  it('renders headings saying "Welcome"', async function() {
    jest.spyOn(axios, 'post').mockReturnValue(new Promise(() => {}));
    render(<Welcome />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome');
  });

  // Since the logo is next to the name of the product, it is supplementary from an a11y standpoint.
  // See the spec referenced in the impl
  it('renders a logo image that does NOT have the img role or an accessible name', async function() {
    jest.spyOn(axios, 'post').mockReturnValue(new Promise(() => {}));
    const { container } = render(<Welcome />),
        img = container.querySelector('img');

    expect(img).toBeInTheDocument();
    expect(img).not.toHaveAccessibleName();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  describe('loading', function() {
    it('calls necessary outreach backend calls after rendering', async function() {
      jest.spyOn(axios, 'post').mockReturnValue(new Promise(() => {}));
      render(<Welcome />);

      expect(axios.post).toHaveBeenCalledWith('/service/extdirect', [
        expect.objectContaining({ action: 'outreach_Outreach', method: 'readStatus' }),
        expect.objectContaining({ action: 'outreach_Outreach', method: 'getProxyDownloadNumbers' })
      ]);
    });

    it('renders a loading spinner until the outreach backend calls complete', async function() {
      render(<Welcome />);

      const status = selectors.loadingStatus();
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('Loading');

      await waitForElementToBeRemoved(status);
    });
  });

  describe('error handling', function() {
    beforeEach(function() {
      user = { administrator: true };
      jest.spyOn(axios, 'post').mockRejectedValue({ message: 'foobar' });
    });

    it('renders an error alert when the extdirect call fails', async function() {
      render(<Welcome />);

      const error = await selectors.errorAlert('find');
      expect(error).toHaveTextContent(/error/i);
      expect(error).toHaveTextContent('foobar');
    });

    it('renders a Retry button within the error alert', async function() {
      render(<Welcome />);

      const error = await selectors.errorAlert('find'),
          retryBtn = selectors.errorRetryBtn();

      expect(error).toContainElement(retryBtn);
    });

    it('re-executes the backend call when Retry is clicked', async function() {
      render(<Welcome />);

      expect(axios.post).toHaveBeenCalledTimes(1);

      const retryBtn = await selectors.errorRetryBtn('find');
      await userEvent.click(retryBtn);

      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
      expect(axios.post).toHaveBeenLastCalledWith('/service/extdirect', [
        expect.objectContaining({ action: 'outreach_Outreach', method: 'readStatus' }),
        expect.objectContaining({ action: 'outreach_Outreach', method: 'getProxyDownloadNumbers' }),
        expect.objectContaining({ action: 'outreach_Outreach', method: 'showFirewallAlert' })
      ]);
    });
  });

  describe('firewall alert', function() {
    beforeEach(function() {
      user = {administrator: true};
    });

    function mockFirewallResponse(returnValue) {
      // NOTE: response array order does not necessarily match request array order
      jest.spyOn(axios, 'post').mockReturnValue({
        data: [
          testData.showFirewallAlertDisclaimer(returnValue),
          testData.outreachReadStatusBasicSuccess,
          testData.outreachGetProxyDownloadNumbersBasicSuccess
        ]
      });
    }

    it('renders a region named "Firewall Capability Notice" if the showFirewallAlert call returns true',
        async function() {
          mockFirewallResponse(true);
          render(<Welcome/>);
          const loadingSpinner = selectors.loadingStatus();
          await waitForElementToBeRemoved(loadingSpinner);
          expect(selectors.firewallCapabilityNotice('query')).toBeInTheDocument();
        }
    );

    it('does not render the firewall region if showFirewallAlert returns false',
        async function() {
          mockFirewallResponse(false);
          render(<Welcome/>);
          const loadingSpinner = selectors.loadingStatus();
          await waitForElementToBeRemoved(loadingSpinner);
          expect(selectors.firewallCapabilityNotice('query')).not.toBeInTheDocument();
        });

    it('does not render the firewall region if the user is not an admin',
        async function() {
          user = {administrator: false};
          mockFirewallResponse(false);
          render(<Welcome/>);
          const loadingSpinner = selectors.loadingStatus();
          await waitForElementToBeRemoved(loadingSpinner);
          expect(selectors.firewallCapabilityNotice('query')).not.toBeInTheDocument();
        });

    it('does not render the firewall region if the user is not logged in',
        async function() {
          user = null;
          mockFirewallResponse(false);
          render(<Welcome/>);
          const loadingSpinner = selectors.loadingStatus();
          await waitForElementToBeRemoved(loadingSpinner);
          expect(selectors.firewallCapabilityNotice('query')).not.toBeInTheDocument();
        });
  });

  describe('outreach iframe', function() {
    it('renders if the readStatus backend call does not fail', async function() {
      render(<Welcome />);

      const frame = await selectors.outreachFrame('find');
      expect(frame.tagName).toBe('IFRAME');
      expect(frame).toBeInTheDocument();
    });

    it('does not render if the extdirect call fails', async function() {
      jest.spyOn(axios, 'post').mockRejectedValue();

      render(<Welcome />);

      const loadingSpinner = selectors.loadingStatus();
      await waitForElementToBeRemoved(loadingSpinner);
      expect(selectors.outreachFrame('query')).not.toBeInTheDocument();
    });

    it('sets the iframe URL with the appropriate query parameters based on the status and license', async function() {
      jest.spyOn(ExtJS, 'useStatus').mockReturnValue({ version: '1.2.3-foo', edition: 'bar' });
      jest.spyOn(ExtJS, 'useLicense').mockReturnValue({ daysToExpiry: 42 });

      render(<Welcome />);

      const frame = await selectors.outreachFrame('find');
      expect(frame).toHaveAttribute('src', expect.stringMatching(/\?(.+&)?version=1\.2\.3-foo/));
      expect(frame).toHaveAttribute('src', expect.stringMatching(/\?(.+&)?versionMm=1\.2/));
      expect(frame).toHaveAttribute('src', expect.stringMatching(/\?(.+&)?edition=bar/));
      expect(frame).toHaveAttribute('src', expect.stringMatching(/\?(.+&)?daysToExpiry=42/));
    });

    it('sets the usertype query param to "admin" if the user is logged in as an admin', async function() {
      user = { administrator: true };

      render(<Welcome />);

      const frame = await selectors.outreachFrame('find');
      expect(frame).toHaveAttribute('src', expect.stringMatching(/\?(.*&)?usertype=admin/));
    });

    it('sets the usertype query param to "normal" if the user is logged and is not an admin', async function() {
      user = { administrator: false };

      render(<Welcome />);

      const frame = await selectors.outreachFrame('find');
      expect(frame).toHaveAttribute('src', expect.stringMatching(/\?(.*&)?usertype=normal/));
    });

    it('sets the usertype query param to "anonymous" if the user is not logged in', async function() {
      render(<Welcome />);

      const frame = await selectors.outreachFrame('find');
      expect(frame).toHaveAttribute('src', expect.stringMatching(/\?(.*&)?usertype=anonymous/));
    });

    it('sets iframe query parameters based on the getProxyDownloadNumbers API response', async function() {
      jest.spyOn(axios, 'post').mockResolvedValue({
        data: [
          testData.outreachReadStatusBasicSuccess,
          testData.outreachGetProxyDownloadNumbers('&abc=123&def=9000')
        ]
      });

      render(<Welcome />);

      const frame = await selectors.outreachFrame('find');
      expect(frame).toHaveAttribute('src', expect.stringMatching(/\?(.*&)?abc=123/));
      expect(frame).toHaveAttribute('src', expect.stringMatching(/\?(.*&)?def=9000/));
    });
  });
});
