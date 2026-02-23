declare module '@microsoft/clarity' {
  function init(projectId: string): void;
  function identify(
    customId: string,
    customSessionId?: string,
    customPageId?: string,
    friendlyName?: string
  ): void;
  function setTag(key: string, value: string | string[]): void;
  function event(eventName: string): void;
  function consent(consent?: boolean): void;
  function consentV2(consentOptions?: {
    ad_Storage?: 'granted' | 'denied';
    analytics_Storage?: 'granted' | 'denied';
  }): void;
  function upgrade(reason: string): void;

  const defaultExport: {
    init: typeof init;
    identify: typeof identify;
    setTag: typeof setTag;
    event: typeof event;
    consent: typeof consent;
    consentV2: typeof consentV2;
    upgrade: typeof upgrade;
  };

  export default defaultExport;
}
